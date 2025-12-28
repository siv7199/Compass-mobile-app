import sqlite3
import math
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_NAME = r'..\database\compass.db'

def calculate_compass_score(school_data, user_budget, soc_prefix="00"):
    # ... checks ...
    debt = school_data.get('debt')
    earnings = school_data.get('earnings')
    net_price = school_data.get('net_price')
    
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
    disposable_income = earnings - 30000
    if disposable_income <= 0:
        debt_years = 999 
    else:
        debt_years = debt / disposable_income
        
    roi_score = max(0, w_roi - (debt_years * (w_roi / 10))) # Scale decay

    # 3. Budget Score
    if user_budget > 0:
        price_ratio = net_price / user_budget
        if price_ratio <= 1.0:
            budget_score = w_budget
        else:
            budget_score = max(0, w_budget - ((price_ratio - 1.0) * 100))
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
        'debt_payoff_years': round(debt_years, 2) if debt_years != 999 else "Infinite",
        'ranking_tier': tier
    }

def find_loadout(user_gpa, target_career_soc, user_budget, user_sat=None):
    """
    Find schools for a target career, filtered by GPA/SAT and sorted by Compass Score.
    
    Args:
        user_gpa (float): User's GPA.
        target_career_soc (str): Target career SOC code (or 'major' identifier).
        user_budget (int): User's budget.
        user_sat (int, optional): User's SAT score.
        
    Returns:
        list: List of dicts representing matched schools.
    """
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # 1. Bridge: Get CIP Prefix from SOC code
    # We strip to first 2 digits
    soc_prefix = target_career_soc[:2]
    
    # Query bridge to get compatible CIP prefixes
    # Note: Our bridge is heuristic. We stored CIP_PREFIX -> SOC_PREFIX
    c.execute("SELECT CIP_PREFIX FROM major_to_career WHERE SOC_PREFIX = ?", (soc_prefix,))
    cip_prefixes = [row[0] for row in c.fetchall()]
    
    logging.info(f"Target SOC: {target_career_soc} (Prefix: {soc_prefix}) -> Mapped CIP Prefixes: {cip_prefixes}")
    
    if not cip_prefixes:
        # Fallback: if no map, assume same prefix if exists? Or empty.
        logging.warning(f"No major mapping found for SOC prefix {soc_prefix}")
        return []

    # 2. Find Candidates: Schools with programs in these CIPs
    # We join everything needed: School info + Fin Data + Admissions
    # Need to handle multiple CIP matches.
    placeholders = ','.join('?' * len(cip_prefixes))
    
    query = f"""
    SELECT DISTINCT s.UNITID, s.INSTNM, s.NET_PRICE, s.EARNINGS_MEDIAN, s.DEBT_MEDIAN,
           a.SATVR75, a.SATMT75, s.ADM_RATE
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
        logging.info(f"Found {len(candidates)} candidate schools before admissions filter.")
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
        return []
    
    results = []
    
    for row in candidates:
        unitid, name, net_price, earnings, debt, sat_vr, sat_mt, adm_rate = row
        
        # 3. Admissions Filter & Hard Mode
        
        if sat_vr and sat_mt:
            school_sat_75 = sat_vr + sat_mt
            school_gpa_req = school_sat_75 / 400
        else:
            school_sat_75 = 1000 # Default ~2.5 GPA equivalent
            school_gpa_req = 2.5 
            
        admission_chance = False
        is_safety_school = False
        
        
        # Check SAT if provided
        if user_sat:
            # Can I get in? (User > School - 150)
            # Tighter gap: 100 was too tight? No, 150 is more lenient? 
            # 1300 vs 1580. 1580-150 = 1430. 1300 < 1430. Fail.
            if user_sat >= (school_sat_75 - 150):
                admission_chance = True
            
            # HARD MODE: Is this school too easy? (User > School + 200)
            if user_sat > 1350 and user_sat > (school_sat_75 + 250):
                 is_safety_school = True
        
        # Check GPA only if SAT was NOT provided
        # If SAT was provided and failed, GPA cannot save you for elite schools.
        elif user_gpa:
             # Strict buffer: 0.2
             if user_gpa >= (school_gpa_req - 0.2):
                admission_chance = True
        
        # Final decision
        if not admission_chance:
            continue
            
        if is_safety_school:
            # Skip this school if it's a safety for a high-stat user
            continue
            
        # 4. Calculate Score
        school_data = {
            'net_price': net_price,
            'earnings': earnings,
            'debt': debt,
            'adm_rate': adm_rate,
            'sat_75': school_sat_75
        }
        
        compass = calculate_compass_score(school_data, user_budget, soc_prefix)
        
        # Add Prestige Boost to Compass Score directly? 
        # Actually calculate_compass_score should handle it or we add it here.
        # Let's add it here to modify the result.
        
        final_score = compass['score']
        
        # Update Ranking based on new score
        if final_score >= 96: tier = 'S'
        elif final_score >= 86: tier = 'A'
        elif final_score >= 76: tier = 'B'
        elif final_score >= 60: tier = 'C'
        else: tier = 'F'
        
        results.append({
            'school_id': unitid,
            'school_name': name,
            'compass_score': int(final_score),
            'ranking': tier,
            'debt_years': compass['debt_payoff_years'],
            'net_price': net_price,
            'earnings': earnings,
            'debt': debt,
            'adm_rate': adm_rate
        })
        
    # 5. Sort
    results.sort(key=lambda x: x['compass_score'], reverse=True)
    
    conn.close()
    return results

if __name__ == "__main__":
    # Test Run
    test_career = "15-1252.00" # Software Developers (SOC 15)
    test_gpa = 3.5
    test_budget = 20000 
    
    matches = find_loadout(test_gpa, test_career, test_budget)
    
    print(f"Found {len(matches)} matches for Career {test_career}, GPA {test_gpa}, Budget ${test_budget}")
    for m in matches[:5]:
        print(f"[{m['ranking']}] {m['school_name']} - Score: {m['compass_score']} (Debt Years: {m['debt_years']})")
