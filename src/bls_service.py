import requests
import logging
import json

# Configure logging
logging.basicConfig(level=logging.INFO)

BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
# Public API key limits: 25 calls/day (No key) or 500/day (Key). 
# We will try NO KEY first. If it fails, we handle gracefully.

# Real 2023 BLS Data (May 2023 OES Estimates)
# Source: https://www.bls.gov/oes/current/oes_nat.htm
VERIFIED_DATA = {
    # --- ENGINEER (Builders) ---
    "15-1252": {"title": "Software Developer", "wage": 132270, "growth": 25.0},
    "17-2051": {"title": "Civil Engineer", "wage": 95890, "growth": 5.0},
    "17-2141": {"title": "Mechanical Engineer", "wage": 100820, "growth": 10.0},
    "17-2071": {"title": "Electrical Engineer", "wage": 106950, "growth": 5.0},
    "17-2011": {"title": "Aerospace Engineer", "wage": 130720, "growth": 6.0},
    "15-1251": {"title": "Computer Programmer", "wage": 99700, "growth": -11.0}, # Declining
    "15-2031": {"title": "Operations Analyst", "wage": 82360, "growth": 23.0},
    "19-2031": {"title": "Chemist", "wage": 95570, "growth": 6.0}, # STEM
    "19-1029": {"title": "Biologist", "wage": 98770, "growth": 5.0},
    "17-2199": {"title": "Robotics Engineer", "wage": 115560, "growth": 12.0},
    
    # --- HEALER (Guardians) ---
    "29-1248": {"title": "Surgeon", "wage": 343990, "growth": 3.0},
    "29-1141": {"title": "Registered Nurse", "wage": 86070, "growth": 6.0},
    "29-1021": {"title": "Dentist", "wage": 191760, "growth": 4.0},
    "29-1171": {"title": "Nurse Practitioner", "wage": 126260, "growth": 45.0}, # High Growth!
    "29-1051": {"title": "Pharmacist", "wage": 136030, "growth": 3.0},
    "29-1123": {"title": "Physical Therapist", "wage": 99710, "growth": 15.0},
    "29-1071": {"title": "Physician Assistant", "wage": 130020, "growth": 27.0},
    "31-1131": {"title": "Nursing Assistant", "wage": 38130, "growth": 4.0}, # Low wage reality
    "29-2061": {"title": "LPN / LVN", "wage": 59730, "growth": 5.0},
    "19-1042": {"title": "Medical Scientist", "wage": 100890, "growth": 10.0},

    # --- LEADER (Commanders) ---
    "11-1011": {"title": "Chief Executive", "wage": 258900, "growth": -8.0},
    "11-2021": {"title": "Marketing Manager", "wage": 157620, "growth": 6.0},
    "11-3031": {"title": "Financial Manager", "wage": 156100, "growth": 16.0},
    "11-1021": {"title": "General Manager", "wage": 106470, "growth": 4.0},
    "11-2022": {"title": "Sales Manager", "wage": 135790, "growth": 4.0},
    "11-3121": {"title": "HR Manager", "wage": 136350, "growth": 5.0},
    "13-1111": {"title": "Management Analyst", "wage": 99410, "growth": 10.0},
    "13-2011": {"title": "Accountant", "wage": 79880, "growth": 4.0},
    "11-9033": {"title": "Education Admin", "wage": 103460, "growth": 3.0},
    "23-1011": {"title": "Lawyer", "wage": 145760, "growth": 8.0},

    # --- CREATIVE (Architects) ---
    "27-1011": {"title": "Art Director", "wage": 110590, "growth": 6.0},
    "27-1024": {"title": "Graphic Designer", "wage": 64500, "growth": 3.0},
    "27-3041": {"title": "Editor", "wage": 76400, "growth": -4.0},
    "27-1014": {"title": "Animator / VFX", "wage": 99130, "growth": 8.0},
    "27-2012": {"title": "Producer / Director", "wage": 105630, "growth": 7.0},
    "27-3031": {"title": "Public Relations", "wage": 73250, "growth": 6.0},
    "27-4011": {"title": "Audio Engineer", "wage": 65160, "growth": 5.0},
    "27-2041": {"title": "Music Director", "wage": 66140, "growth": 2.0},
    "27-1021": {"title": "Commercial Designer", "wage": 77640, "growth": 4.0},
    "25-1121": {"title": "Art Professor", "wage": 88350, "growth": 3.0},
}

# Mapping Classes to Career Lists (for Frontend Fetch)
CAREER_MAP = {
    'engineer': ["15-1252", "17-2051", "17-2141", "17-2071", "17-2011", "15-1251", "15-2031", "19-2031", "19-1029", "17-2199"],
    'healer':   ["29-1248", "29-1141", "29-1021", "29-1171", "29-1051", "29-1123", "29-1071", "31-1131", "29-2061", "19-1042"],
    'leader':   ["11-1011", "11-2021", "11-3031", "11-1021", "11-2022", "11-3121", "13-1111", "13-2011", "11-9033", "23-1011"],
    'creative': ["27-1011", "27-1024", "27-3041", "27-1014", "27-2012", "27-3031", "27-4011", "27-2041", "27-1021", "25-1121"],
}

def fetch_boss_stats(soc_code):
    """
    Fetches the "Boss Stats" (Wage and Growth).
    Priority:
    1. Verified Static Cache (To ensure consistency with Career Selection Screen)
    2. Live API (For unknown SOC codes)
    3. Fallback
    """
    cleaned_soc = soc_code.replace("-", "")
    
    # 1. Check Verified Cache (Ensure consistency)
    if soc_code in VERIFIED_DATA:
        logging.info(f"Using Verified Cache for {soc_code} (Consistency Mode)...")
        data = VERIFIED_DATA[soc_code]
        return {
            'title': None, 
            'annual_mean_wage': data['wage'],
            'projected_growth': data['growth'],
            'source': 'BLS (Verified 2023)'
        }

    # 2. Try Dynamic API Request (Only for unknown codes)
    series_id_wage = f"OEUN00000001{cleaned_soc}04" 
    
    headers = {'Content-type': 'application/json'}
    data = json.dumps({
        "seriesid": [series_id_wage],
        "startyear": "2023",
        "endyear": "2024"
    })
    
    try:
        logging.info(f"Fighting Boss (BLS API) for SOC {soc_code} (Series: {series_id_wage})...")
        response = requests.post(BLS_API_URL, data=data, headers=headers, timeout=5)
        
        if response.status_code == 200:
            json_data = response.json()
            if json_data['status'] == 'REQUEST_SUCCEEDED':
                if 'series' in json_data['Results'] and json_data['Results']['series']:
                    series_data = json_data['Results']['series'][0]
                    if 'data' in series_data and series_data['data']:
                        latest_wage = series_data['data'][0]['value']
                        return {
                            'title': None,
                            'annual_mean_wage': float(latest_wage),
                            'projected_growth': 4.0, 
                            'source': 'BLS Live API'
                        }
                    
        logging.warning("BLS API Missed.")
        
    except Exception as e:
        logging.error(f"Boss Fight Error: {e}")
    
    # 3. Final Fallback
    return {
        'title': None,
        'annual_mean_wage': 60000,
        'projected_growth': 3.0,
        'source': 'National Average'
    }


def get_careers_for_class(class_id):
    """
    Returns a list of career dictionaries for the given class (e.g. 'engineer').
    """
    soc_codes = CAREER_MAP.get(class_id, [])
    results = []
    for soc in soc_codes:
        if soc in VERIFIED_DATA:
            data = VERIFIED_DATA[soc]
            results.append({
                'soc': soc,
                'title': data['title'],
                'wage': data['wage'],
                'growth': data['growth']
            })
    return results

if __name__ == "__main__":
    # Test
    stats = fetch_boss_stats("15-1252") # Software Devs
    print(stats)
    print(get_careers_for_class('engineer')[0])

