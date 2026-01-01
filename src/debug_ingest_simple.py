import requests
import sqlite3
import json
import os

print("--- START DEBUG ---")

# DB Check
try:
    conn = sqlite3.connect(r'..\database\compass.db')
    c = conn.cursor()
    c.execute("SELECT count(*) FROM schools")
    count = c.fetchone()[0]
    print(f"DB Connection Successful. Schools Count: {count}")
    
    c.execute("SELECT unitid FROM schools LIMIT 1")
    first_id = c.fetchone()[0]
    print(f"Sample ID: {first_id}")
    conn.close()
except Exception as e:
    print(f"DB Error: {e}")

# API Check
ENV_PATH = r'..\data\.env'
API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG" # Fallback
try:
    with open(ENV_PATH, 'r') as f:
        for line in f:
            if 'SCORECARD' in line and '=' in line:
                API_KEY = line.split('=')[1].strip()
                break
except: pass

print(f"Computed Key: {API_KEY[:5]}...")

BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools"
# Test Harvard (166027)
test_id = "166027"
fields = "id,school.name,cost.tuition.out_of_state,latest.cost.tuition.out_of_state"

url = f"{BASE_URL}?id={test_id}&fields={fields}&api_key={API_KEY}"
print(f"Requesting URL (masked): {url.replace(API_KEY, 'KEY')}")

try:
    resp = requests.get(url, timeout=10)
    print(f"Status Code: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print("Response Keys:", list(data.keys()))
        if 'results' in data:
            print(f"Results Count: {len(data['results'])}")
            print("First Result:", json.dumps(data['results'][0], indent=2))
        else:
            print("No 'results' key found.")
            print(data)
    else:
        print("Error Text:", resp.text[:500])
except Exception as e:
    print(f"Request Exception: {e}")

print("--- END DEBUG ---")
