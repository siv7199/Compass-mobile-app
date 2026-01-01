import requests
import json

try:
    r = requests.post("http://127.0.0.1:8000/api/score", json={"gpa": 3.8, "sat": 1400, "major": "15-1252", "budget": 50000})
    data = r.json()
    if data:
        first = data[0]
        print(f"SAMPLE SCHOOL: {first.get('school_name')}")
        print(f"STICKER: {first.get('sticker_price')}")
        print(f"NET: {first.get('net_price')}")
    else:
        print("No results.")
except Exception as e:
    print(f"Error: {e}")
