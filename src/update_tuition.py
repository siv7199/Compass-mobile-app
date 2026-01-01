import sqlite3
import requests
import logging
import time
import os

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_NAME = r'..\database\compass.db' 
if not os.path.exists(r'..\database\compass.db'):
    DB_NAME = r'database\compass.db'

API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools.json"

def add_column():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    try:
        c.execute("ALTER TABLE schools ADD COLUMN STICKER_PRICE INTEGER")
        logging.info("Added STICKER_PRICE column.")
    except sqlite3.OperationalError:
        logging.info("STICKER_PRICE column already exists.")
    conn.commit()
    conn.close()

def chunk_list(lst, n):
    """Yield successive n-sized chunks from lst."""
    for i in range(0, len(lst), n):
        yield lst[i:i + n]

def fetch_and_update():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Get all UNITIDs
    c.execute("SELECT UNITID FROM schools")
    all_ids = [row[0] for row in c.fetchall()]
    conn.close()
    
    logging.info(f"Updating Tuition for {len(all_ids)} schools...")
    
    # Process in chunks of 50
    chunks = list(chunk_list(all_ids, 50))
    
    for i, chunk in enumerate(chunks):
        ids_str = ",".join(map(str, chunk))
        params = {
            "api_key": API_KEY,
            "id": ids_str,
            "fields": "id,latest.cost.attendance.academic_year"
        }
        
        try:
            response = requests.get(BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
            
            conn = sqlite3.connect(DB_NAME)
            c = conn.cursor()
            
            for result in data.get('results', []):
                unitid = result.get('id')
                sticker = result.get('latest.cost.attendance.academic_year')
                
                if sticker:
                    c.execute("UPDATE schools SET STICKER_PRICE = ? WHERE UNITID = ?", (sticker, unitid))
            
            conn.commit()
            conn.close()
            logging.info(f"Updated chunk {i+1}/{len(chunks)}")
            
        except Exception as e:
            logging.error(f"Error updating chunk {i}: {e}")
            
        time.sleep(0.2) # Rate limit niceness

if __name__ == "__main__":
    add_column()
    fetch_and_update()
