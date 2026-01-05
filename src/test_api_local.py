import requests
import json

try:
    api_url = "http://192.168.1.191:8000/api/score" 
    base_url = "http://192.168.1.191:8000"
    
    print(f"Testing URL: {base_url}/api/score")
    resp = requests.post(
        f"{base_url}/api/score", 
        json={"gpa": 3.0, "major": "11-1021.00", "budget": 20000, "sat": 1200},
        headers={"Bypass-Tunnel-Reminder": "true"}
    )
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print("Success! Response preview:")
        print(json.dumps(resp.json()[:2], indent=2))
    else:
        print(f"Error Body: {resp.text}")
except Exception as e:
    print(f"Connection Error: {e}")
