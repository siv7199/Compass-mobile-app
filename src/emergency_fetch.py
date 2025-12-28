import sqlite3
import requests
import logging

logging.basicConfig(level=logging.INFO)

API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools.json"
DB_NAME = r'..\database\compass.db'

def emergency_fetch():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # 1. Get IDs for Elites
    elites = ['Harvard University', 'Stanford University', 'Yale University', 'Princeton University', 'Massachusetts Institute of Technology']
    ids = []
    
    for name in elites:
        c.execute("SELECT UNITID FROM schools WHERE INSTNM = ?", (name,))
        row = c.fetchone()
        if row:
            ids.append(row[0])
            print(f"Queueing {name} (ID: {row[0]})")
    
    conn.close()
    
    # 2. Fetch Data
    ids_str = ",".join(map(str, ids))
    params = {
        "api_key": API_KEY,
        "id": ids_str,
        "fields": "id,latest.earnings.10_yrs_after_entry.median,latest.aid.median_debt.completers.overall,latest.cost.avg_net_price.overall,latest.admissions.admission_rate.overall"
    }
    
    print("Fetching data from API...")
    response = requests.get(BASE_URL, params=params)
    
    if response.status_code == 200:
        data = response.json()
        results = data.get('results', [])
        
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        
        for result in results:
            unitid = result.get('id')
            earnings = result.get('latest.earnings.10_yrs_after_entry.median')
            debt = result.get('latest.aid.median_debt.completers.overall')
            net_price = result.get('latest.cost.avg_net_price.overall')
            adm_rate = result.get('latest.admissions.admission_rate.overall')
            
            print(f"Updating {unitid}: P=${net_price}, E=${earnings}, A={adm_rate}")
            
            c.execute("""
                UPDATE schools
                SET EARNINGS_MEDIAN = ?, DEBT_MEDIAN = ?, NET_PRICE = ?, ADM_RATE = ?
                WHERE UNITID = ?
            """, (earnings, debt, net_price, adm_rate, unitid))
            
        conn.commit()
        conn.close()
        print("Success! Elites updated.")
    else:
        print(f"Error: {response.text}")

if __name__ == "__main__":
    emergency_fetch()
