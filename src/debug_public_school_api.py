import requests
import json
import os

# Load Key
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

# IDs: 
# 100654 = Alabama A&M (Public)
# 199120 = UNC Chapel Hill (Public)
ids = "100654,199120"
fields = "id,school.name,cost.attendance.academic_year,cost.tuition.out_of_state,cost.tuition.in_state,cost.roomboard.oncampus,cost.books_supplies"

print(f"Fetching debug data forPublic Schools ({ids})...")
url = f"{BASE_URL}?id={ids}&fields={fields}&api_key={API_KEY}"
resp = requests.get(url)

if resp.status_code == 200:
    print(json.dumps(resp.json(), indent=2))
else:
    print(f"Error: {resp.status_code}")
