import sqlite3
import requests
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)

API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools.json"
DB_NAME = r'..\database\compass.db'

def fetch_specific_schools():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Target "University of North Carolina" specifically
    c.execute("SELECT UNITID, INSTNM FROM schools WHERE INSTNM LIKE 'University of North Carolina%'")
    rows = c.fetchall()
    
    logging.info(f"Found {len(rows)} UNC schools to update.")
    
    ids = [str(r[0]) for r in rows]
    # Also grab UVa while we are at it
    c.execute("SELECT UNITID FROM schools WHERE INSTNM LIKE 'University of Virginia%'")
    ids += [str(r[0]) for r in c.fetchall()]
    
    # Fetch in batch
    chunk_size = 20
    for i in range(0, len(ids), chunk_size):
        chunk = ids[i:i + chunk_size]
        ids_str = ",".join(chunk)
        
        params = {
            "api_key": API_KEY,
            "id": ids_str,
            "fields": "id,latest.earnings.10_yrs_after_entry.median,latest.aid.median_debt.completers.overall,latest.cost.avg_net_price.overall,latest.admissions.admission_rate.overall"
        }
        
        response = requests.get(BASE_URL, params=params)
        if response.status_code == 200:
             data = response.json()
             for result in data.get('results', []):
                 unitid = result.get('id')
                 earnings = result.get('latest.earnings.10_yrs_after_entry.median')
                 debt = result.get('latest.aid.median_debt.completers.overall')
                 net_price = result.get('latest.cost.avg_net_price.overall')
                 adm_rate = result.get('latest.admissions.admission_rate.overall')
                 
                 print(f"Updated {unitid} (UNC/UVA metrics). Earnings: {earnings}")
                 
                 c.execute("""
                    UPDATE schools
                    SET EARNINGS_MEDIAN = ?, DEBT_MEDIAN = ?, NET_PRICE = ?, ADM_RATE = ?
                    WHERE UNITID = ?
                """, (earnings, debt, net_price, adm_rate, unitid))
                 conn.commit()
                 
    conn.close()

if __name__ == "__main__":
    fetch_specific_schools()
