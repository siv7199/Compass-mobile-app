import requests
import sqlite3
import time

# Config
ENV_PATH = r'..\data\.env'
API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG" 
try:
    with open(ENV_PATH, 'r') as f:
        for line in f:
            if 'SCORECARD' in line and '=' in line:
                API_KEY = line.split('=')[1].strip()
                break
except: pass

BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"
# Harvard (166027), UNC (199120), Alabama A&M (100654)
target_ids = ["166027", "199120", "100654"]
fields = "id,school.name,cost.tuition.out_of_state,cost.tuition.in_state,cost.attendance.academic_year,cost.roomboard.oncampus,cost.books_supplies"

print("--- FORCE UPDATING KEY SCHOOLS ---")
conn = sqlite3.connect(r'..\database\compass.db')
c = conn.cursor()

ids_str = ",".join(target_ids)
url = f"{BASE_URL}?id={ids_str}&fields={fields}&api_key={API_KEY}"

resp = requests.get(url)
if resp.status_code == 200:
    results = resp.json().get('results', [])
    updates = []
    for school in results:
        uid = school.get('id')
        name = school.get('school.name')
        sticker = school.get('cost.attendance.academic_year')
        
        if not sticker:
            tuition = school.get('cost.tuition.out_of_state') or school.get('cost.tuition.in_state')
            room = school.get('cost.roomboard.oncampus') or 14000
            books = school.get('cost.books_supplies') or 1200
            if tuition:
                sticker = tuition + room + books
        
        if sticker:
            print(f"Updating {name} ({uid}) -> ${sticker}")
            updates.append((sticker, uid))
            
    if updates:
        c.executemany("UPDATE schools SET sticker_price = ? WHERE unitid = ?", updates)
        conn.commit()
        print("Success.")
    else:
        print("No updates found.")
else:
    print(f"Error: {resp.status_code}")

conn.close()
