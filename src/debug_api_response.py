import requests
import json

URL = "http://127.0.0.1:8000/api/score"
PAYLOAD = {
    "gpa": 3.8,
    "sat": 1400,
    "major": "15-1252",
    "budget": 50000
}

try:
    print(f"Sending request to {URL}...")
    response = requests.post(URL, json=PAYLOAD)
    response.raise_for_status()
    data = response.json()
    
    if not data:
        print("No results returned.")
    else:
        print(f"Received {len(data)} results.")
        first = data[0]
        print("First School Sample:")
        print(json.dumps(first, indent=2))
        
        if 'sticker_price' in first:
            print(f"Sticker Price present: {first['sticker_price']}")
        else:
            print("ERROR: sticker_price key MISSING in response.")
            
except Exception as e:
    print(f"Request failed: {e}")
