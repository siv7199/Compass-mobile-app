import requests
import json

URL = "http://127.0.0.1:8000/api/score"
PAYLOAD = {
    "gpa": 4.0,
    "sat": 1600,
    "budget": 100000,
    "major": "11-1011"
}

try:
    print(f"Sending POST to {URL}...")
    resp = requests.post(URL, json=PAYLOAD)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        print(f"Items returned: {len(data)}")
        if len(data) > 0:
            first = data[0]
            print("First Item Keys:", list(first.keys()))
            # print("First Item:", json.dumps(first, indent=2))
            
            # Check for Harvard
            harvard = next((x for x in data if "Harvard" in x.get('school_name', '')), None)
            if harvard:
                print("\nHarvard Found:")
                # Print keys related to price
                print("Harvard net_price:", harvard.get('net_price'))
                print("Harvard adm_rate:", harvard.get('adm_rate'))
                print("Harvard sticker_price:", harvard.get('sticker_price'))
                print("Harvard Keys:", list(harvard.keys()))
            else:
                print("\nHarvard NOT found in top results.")
    else:
        print("Error:", resp.text)

except Exception as e:
    print(f"Exception: {e}")
