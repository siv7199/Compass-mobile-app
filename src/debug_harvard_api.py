import requests
import json

API_KEY = "iwuxcYzWCVDjcqNHGsaeH2EqFkIigF8hg1c8pdPG"
BASE_URL = "https://api.data.gov/ed/collegescorecard/v1/schools.json"
HARVARD_ID = 166027

params = {
    "api_key": API_KEY,
    "id": HARVARD_ID,
    "fields": "id,school.name,latest.cost.attendance.academic_year,latest.cost.tuition.out_of_state,latest.cost.tuition.in_state,latest.cost.avg_net_price.overall"
}

response = requests.get(BASE_URL, params=params)
if response.status_code == 200:
    print(json.dumps(response.json(), indent=2))
else:
    print(f"Error: {response.status_code} {response.text}")
