import logging
import os
import sqlite3

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Robust Path Handling (Works on Windows & Linux/Render)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_NAME = os.path.join(BASE_DIR, 'compass.db')

def calculate_compass_score(school_data, user_budget, soc_prefix="00", user_gpa=3.5, user_sat=None):
    # ... checks ...
    debt = school_data.get('debt')
    earnings = school_data.get('earnings')
    net_price = school_data.get('net_price')
    sticker_price = school_data.get('sticker_price')
    
    if not isinstance(debt, (int, float)) or not isinstance(earnings, (int, float)) or not isinstance(net_price, (int, float)):
        return {'score': 0, 'debt_payoff_years': -1, 'ranking_tier': 'N/A'}

    # 1. Define Weights based on Persona
    # Defaults (Balanced)
    w_roi = 40
    w_budget = 30
    w_prestige = 30
    
    if soc_prefix in ['11', '13']: # Leader (Business/Mgmt) -> Power/Prestige/Money
        w_roi = 40
        w_budget = 20
        w_prestige = 40
    elif soc_prefix in ['27', '21', '25']: # Creative (Arts) -> Cost matters, Prest less crit?
        w_roi = 20
        w_budget = 60 # Budget is king for starving artists
        w_prestige = 20
    elif soc_prefix in ['15', '17', '11-3']: # Engineer (STEM) -> ROI is everything
        w_roi = 60
        w_budget = 20
        w_prestige = 20
    elif soc_prefix in ['29', '51']: # Healer -> Balanced
        w_roi = 35
        w_budget = 35
        w_prestige = 30
        
    # 2. ROI Score
    # Updated to match Frontend "Health Bar" Logic (20% Rule)
    # Standard banking assumption: 20% of gross income goes to debt repayment.
    annual_repayment = earnings * 0.20
    
    # DUAL-COST LOGIC:
    # 1. Conservative (Sticker): For UI Display ("Hard Mode").
    # 2. Optimistic (Net): For Scoring (Tier S Visibility).
    # UPDATE (User Request): "Students care about sticker price".
    # We now force BOTH to use Sticker Price primarily. 
    # Fallback to Net Price only if Sticker is missing (0/None) to avoid "Free School" bugs.
    # ROI Score now uses STICKER Price (High Risk)
    # UPDATE: Assess loans based on what budget DOESN'T cover
    annual_cost = sticker_price or net_price or 25000
    
    # 1. Display Payback: Intrinsic ROI (Total Cost / Repayment)
    # Ignores user budget to show "Is this school worth the price?"
    total_program_cost = annual_cost * 4
    if annual_repayment > 0:
        display_debt_years = total_program_cost / annual_repayment
    else:
        display_debt_years = 99.9
        
    # 2. Scoring Payback: Actual Affordability (Loans needed)
    loans_per_year = max(0, annual_cost - user_budget)
    total_loans = loans_per_year * 4
    
    if annual_repayment <= 0:
        score_debt_years = 99.9
    elif total_loans == 0:
        score_debt_years = 0 # Fully covered by budget
    else:
        score_debt_years = total_loans / annual_repayment
        
    # ROI Score now uses STICKER Price (High Risk)
    roi_score = max(0, w_roi - (score_debt_years * 1.5)) 

    # 3. Budget Score
    # GAME BALANCE: Sticker Price is King (Student Perception)
    # UPDATE: Strictly use Sticker Price for Budget Check.
    cost_to_compare = sticker_price or net_price
    
    # ELITE PROTECTION: If school is highly prestigious (Adm Rate < 20%), 
    # we soften the budget penalty.
    is_elite = school_data.get('adm_rate', 1.0) < 0.20
    
    if user_budget > 0:
        price_ratio = cost_to_compare / user_budget
        
        if price_ratio <= 1.0:
            budget_score = w_budget
        else:
            # Linear penalty
            penalty = (price_ratio - 1.0) * 100
            
            # ELITE BUFF REMOVED: User Feedback "Budget is Budget".
            # If you can't afford UCLA ($60k) with $30k budget, it's not S-Tier.
            # if is_elite:
            #    penalty *= 0.25 
                
            budget_score = max(0, w_budget - penalty)
    else:
        budget_score = w_budget / 2

    # 4. Prestige Score
    prestige_score = 0
    adm_rate = school_data.get('adm_rate')
    
    if adm_rate:
        prestige_score = (1.0 - adm_rate) * w_prestige
    elif school_data.get('sat_75', 0) > 1400:
        prestige_score = w_prestige
    
    final_score = roi_score + budget_score + prestige_score

    # BUDGET NUKE: If over budget, strictly cap tier.
    if user_budget > 0:
        price_ratio = cost_to_compare / user_budget
        if price_ratio > 1.2: # 20% over budget
             final_score *= 0.5
        if price_ratio > 1.5: # 50% over budget (e.g. 45k vs 30k)
             final_score *= 0.1 # F-Tier immediately

    # 5. ADMISSION GATEKEEPER (The "Yes" Patch)
    # If user stats are significantly below school standards, applying massive penalty.
    school_sat_25 = school_data.get('sat_25')
    if user_sat and school_sat_25 and isinstance(school_sat_25, (int, float)):
        # If user is >100 points below 25th percentile -> Reach School (High Risk)
        if user_sat < (school_sat_25 - 50):
            penalty_factor = 0.5 # 50% penalty
            if user_sat < (school_sat_25 - 150):
                penalty_factor = 0.1 # 90% penalty (Mission Impossible)
            
            final_score *= penalty_factor
            
    # GPA Check (Simple proxy if SAT missing)
    # Assuming avg GPA around 3.0-3.5 for most schools. Ivy ~3.9
    if user_gpa:
        # If school is elite (adm < 20%) and GPA < 3.5 -> Penalty
        if is_elite and user_gpa < 3.5:
             final_score *= 0.4

    # SAFETY NET: Ensure valid "Safety Schools" appear as Green/Blue (A/B)
    # If user matches stats and can afford it, don't let low prestige kill the score.
    school_sat_75 = school_data.get('sat_75')
    
    if user_sat and school_sat_75 and user_budget > 0:
        is_strong_candidate = user_sat >= school_sat_75
        is_affordable = (cost_to_compare / user_budget) <= 1.0
        
        if is_strong_candidate and is_affordable:
            # Force boost to at least B-Tier (75) to give users viable options
            if final_score < 75:
                final_score = 75
            
            # If extremely affordable (80% of budget), boost slightly but cap at 80 (A-)
            # We don't want safety schools outranking Ivy League (S-Tier 90+)
            if (cost_to_compare / user_budget) <= 0.8:
                final_score = max(final_score, 80)

    final_score = max(0, min(100, int(final_score)))
    
    # Ranking Tier
    if final_score >= 90:
        tier = 'S'
    elif final_score >= 80:
        tier = 'A'
    elif final_score >= 70:
        tier = 'B'
    elif final_score >= 50:
        tier = 'C'
    else:
        tier = 'F'
        
    return {
        'score': final_score,
        'debt_payoff_years': round(display_debt_years, 2) if display_debt_years != 99.9 else "Infinite",
        'ranking_tier': tier
    }

def find_loadout(user_gpa, target_career_soc, user_budget, user_sat=None, priorities=None, priority_weights=None):
    """
    Find schools for a target career, filtered by GPA/SAT and sorted by Compass Score.
    priorities: list of strings like ['greek', 'sports', 'diversity', 'hbcu', 'research']
    priority_weights: dict mapping priority id to weight (1-10), e.g., {'greek': 4, 'diversity': 7}
    """
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # 1. Bridge: Get CIP Prefix from SOC code
    soc_prefix = target_career_soc[:2]
    
    # BASELINE WAGES (2024 Verified BLS Medians)
    SECTOR_WAGES = {
        '11': 105000, # Management
        '13': 80000,  # Business/Finance
        '15': 102000, # Computer/Math (High ROI)
        '17': 92000,  # Architecture/Engineering
        '19': 75000,  # Life/Physical Science
        '21': 55000,  # Community/Social Service
        '23': 90000,  # Legal
        '25': 62000,  # Education
        '27': 58000,  # Arts/Design
        '29': 85000,  # Healthcare Practitioners
        '31': 48000,  # Healthcare Support
        '33': 55000,  # Protective Service
        '41': 60000,  # Sales
    }
    sector_base = SECTOR_WAGES.get(soc_prefix, 50000)
    
    c.execute("SELECT CIP_PREFIX FROM major_to_career WHERE SOC_PREFIX = ?", (soc_prefix,))
    cip_prefixes = [row[0] for row in c.fetchall()]
    
    logging.info(f"Target SOC: {target_career_soc} (Prefix: {soc_prefix}) -> Sector Base: ${sector_base}")
    
    if not cip_prefixes:
        logging.warning(f"No major mapping found for SOC prefix {soc_prefix}")
        return []

    # 2. Find Candidates
    placeholders = ','.join('?' * len(cip_prefixes))
    
    query = f"""
    SELECT DISTINCT s.UNITID, s.INSTNM, s.NET_PRICE, s.EARNINGS_MEDIAN, s.DEBT_MEDIAN,
            a.SATVR75, a.SATMT75, s.ADM_RATE, s.STICKER_PRICE,
            s.HBCU, s.HAS_GREEK, s.HAS_SPORTS, s.DIVERSITY_INDEX, s.LOCALE, s.C21BASIC,
            s.WEBADDR
    FROM schools s
    JOIN programs p ON s.UNITID = p.UNITID
    LEFT JOIN admissions a ON s.UNITID = a.UNITID
    WHERE substr(p.CIPCODE, 1, 2) IN ({placeholders})
    AND s.EARNINGS_MEDIAN IS NOT NULL
    AND s.DEBT_MEDIAN IS NOT NULL
    """
    
    try:
        c.execute(query, cip_prefixes)
        candidates = c.fetchall()
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
        return []
    
    results = []
    
    for row in candidates:
        try:
            unitid, name, net_price, earnings_school, debt, sat_vr, sat_mt, adm_rate, sticker_price, hbcu, has_greek, has_sports, diversity_index, locale, c21basic, webaddr = row
            
            # Type Safety: Ensure numeric values
            net_price = float(net_price) if net_price else 0
            earnings_school = float(earnings_school) if earnings_school else 0
            debt = float(debt) if debt else 0
            sticker_price = float(sticker_price) if sticker_price else 0
            adm_rate = float(adm_rate) if adm_rate else 1.0
            diversity_index = float(diversity_index) if diversity_index else 0
            
            # REALISM UPDATE: Use School Median directly for diversity.
            # Fallback to sector_base only if data is missing.
            projected_earnings = earnings_school if earnings_school > 0 else sector_base
                 
            # 3. Admissions Filter & Hard Mode
            
            if sat_vr and sat_mt:
                school_sat_75 = sat_vr + sat_mt
                school_gpa_req = school_sat_75 / 400
            else:
                school_sat_75 = 1000 # Default ~2.5 GPA equivalent
                school_gpa_req = 2.5 
            
            admission_chance = False
            is_safety_school = False
            
            if user_sat:
                if user_sat >= (school_sat_75 - 150):
                    admission_chance = True
                # HARD MODE: Is this school too easy?
                if user_sat > 1350 and user_sat > (school_sat_75 + 250):
                     is_safety_school = True
            elif user_gpa:
                 if user_gpa >= (school_gpa_req - 0.2):
                    admission_chance = True
            
            if not admission_chance:
                continue
            # Removed 'Hard Mode' skipping of safety schools. 
            # Users with high stats still want safeties, they just score based on prestige/ROI.
            # if is_safety_school:
            #    continue
                
            # 4. Calculate Score
            school_data = {
                'net_price': net_price,
                'sticker_price': sticker_price, 
                'earnings': projected_earnings, 
                'debt': debt,
                'adm_rate': adm_rate,
                'sat_75': school_sat_75
            }
            
            compass = calculate_compass_score(school_data, user_budget, soc_prefix, user_gpa, user_sat)
            
            final_score = compass['score']
            
            # 5. Priority Boosting (Campus Culture Preferences)
            # Uses priority_weights if provided for personalized scoring
            # Default weights (research-based): research=8, diversity=7, sports=5, greek=4, food=3
            DEFAULT_WEIGHTS = {'research': 8, 'diversity': 7, 'sports': 5, 'greek': 4, 'food': 3}
            weights = priority_weights if priority_weights else DEFAULT_WEIGHTS
            
            if priorities:
                priority_boost = 0
                max_boost_per_priority = 5  # Max 5 points per priority
                
                if 'greek' in priorities and has_greek == 1:
                    weight = weights.get('greek', 4)
                    priority_boost += (weight / 10) * max_boost_per_priority
                    
                if 'sports' in priorities and has_sports == 1:
                    weight = weights.get('sports', 5)
                    priority_boost += (weight / 10) * max_boost_per_priority
                    
                if 'diversity' in priorities and diversity_index and diversity_index > 0.6:
                    weight = weights.get('diversity', 7)
                    priority_boost += (weight / 10) * max_boost_per_priority * 1.6  # High diversity bonus
                    
                if 'hbcu' in priorities and hbcu == 1:
                    priority_boost += 10  # Strong boost for HBCU (not user-adjustable)
                    
                if 'research' in priorities and c21basic in (15, 16):
                    weight = weights.get('research', 8)
                    base_boost = 8 if c21basic == 15 else 5  # R1 gets more than R2
                    priority_boost += (weight / 10) * base_boost
                    
                final_score = min(100, final_score + priority_boost)
            
            # Update Ranking
            if final_score >= 90: tier = 'S'
            elif final_score >= 80: tier = 'A'
            elif final_score >= 70: tier = 'B'
            elif final_score >= 50: tier = 'C'
            else: tier = 'F'
            
            results.append({
                'school_id': unitid,
                'school_name': name,
                'compass_score': int(final_score),
                'ranking': tier,
                'debt_years': compass['debt_payoff_years'],
                'net_price': net_price,
                'sticker_price': sticker_price, 
                'earnings': projected_earnings, 
                'debt': debt,
                'adm_rate': adm_rate,
                'school_url': webaddr,
                'c21basic': c21basic,
                'has_sports': has_sports
            })
            
        except Exception as e:
            logging.warning(f"Error processing school {row[1]}: {e}")
            continue

    # 5. Sort
    results.sort(key=lambda x: x['compass_score'], reverse=True)
    
    # OPTIMIZATION: Return only Top 50 to speed up Tunnel Transfer
    conn.close()
    return results[:50]

if __name__ == "__main__":
    # Test Run
    matches = find_loadout(3.5, "15-1252.00", 20000)
    for m in matches[:5]:
        print(f"[{m['ranking']}] {m['school_name']} - Score: {m['compass_score']} (Debt Years: {m['debt_years']})")
