import requests
try:
    resp = requests.post(
        "https://compass-api-v6.loca.lt/api/score", 
        json={"gpa": 3.0, "major": "11-1021.00", "budget": 20000, "sat": 1200}
    )
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text}")
except Exception as e:
    print(f"Error: {e}")
