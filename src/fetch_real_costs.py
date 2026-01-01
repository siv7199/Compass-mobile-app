import requests
import sqlite3
import time
import os

# API Config
# Load Key from ../data/.env
ENV_PATH = r'..\data\.env'
API_KEY = None

try:
    with open(ENV_PATH, 'r') as f:
        for line in f:
            if 'SCORECARD' in line and '=' in line:
                API_KEY = line.split('=')[1].strip()
                break
    if not API_KEY:
        print("Could not find SCORECARD key in .env")
        # Fallback to the one seen in debug files if needed, or error out
        API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG" 
except Exception as e:
    print(f"Error reading .env: {e}")
    API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG"

BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"

# DB Config
conn = sqlite3.connect(r'..\database\compass.db')
c = conn.cursor()

def fetch_and_update_costs():
    print(f"Fetching REAL Cost Data using Key: {API_KEY[:5]}...")
    
    # Get all UnitIDs
    c.execute("SELECT unitid FROM schools")
    school_ids = [str(row[0]) for row in c.fetchall()]
    
    # Scorecard uses 'id' which matches IPEDS UnitID
    # Fields: 
    # cost.tuition.out_of_state
    # cost.tuition.in_state
    # cost.attendance.academic_year (This is the Total Sticker Price)
    
    fields = "id,school.name,cost.tuition.out_of_state,cost.tuition.in_state,cost.attendance.academic_year,cost.roomboard.oncampus,cost.books_supplies"
    
    # Process in chunks to avoid URL length limits and 500 errors
    chunk_size = 5
    total_updated = 0
    
    # Process in parallel to speed up
    from concurrent.futures import ThreadPoolExecutor
    
    def process_chunk(chunk_data):
        i, chunk = chunk_data
        ids_str = ",".join(chunk)
        updates = []
        try:
            url = f"{BASE_URL}?id={ids_str}&fields={fields}&api_key={API_KEY}" 
            response = requests.get(url, timeout=10)
            if response.status_code == 200:
                data = response.json()
                results = data.get('results', [])
                for school in results:
                    uid = school.get('id')
                    sticker = school.get('cost.attendance.academic_year')
                    if not sticker:
                        tuition = school.get('cost.tuition.out_of_state') or school.get('cost.tuition.in_state')
                        room = school.get('cost.roomboard.oncampus') or 14000
                        books = school.get('cost.books_supplies') or 1200
                        if tuition: sticker = tuition + room + books
                    if sticker: updates.append((sticker, uid))
        except: pass
        return updates

    print("Starting Parallel Ingestion (5 workers)...")
    chunks = []
    for i in range(0, len(school_ids), chunk_size):
        chunks.append((i, school_ids[i:i+chunk_size]))
        
    total_updated = 0
    with ThreadPoolExecutor(max_workers=5) as executor:
        for result in executor.map(process_chunk, chunks):
            if result:
                c.executemany("UPDATE schools SET sticker_price = ? WHERE unitid = ?", result)
                conn.commit()
                total_updated += len(result)
                if total_updated % 100 == 0: print(f"Updated {total_updated} schools...")

    print(f"DONE. Updated {total_updated} schools.")

fetch_and_update_costs()
