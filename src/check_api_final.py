import requests

try:
    r = requests.post("http://127.0.0.1:8000/api/score", json={"gpa": 4.0, "sat": 1600, "major": "15-1252", "budget": 50000})
    data = r.json()
    harvard = next((s for s in data if "Harvard" in s['school_name']), None)
    if harvard:
        print(f"HARVARD FOUND: Sticker=${harvard.get('sticker_price')} Net=${harvard.get('net_price')}")
    else:
        print("Harvard still not found (maybe major filter?)")
except Exception as e:
    print(f"Error: {e}")
