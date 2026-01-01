import requests

try:
    r = requests.post("http://127.0.0.1:8000/api/score", json={"gpa": 3.8, "sat": 1400, "major": "15-1252", "budget": 50000})
    data = r.json()
    harvard = next((s for s in data if "Harvard" in s['school_name']), None)
    if harvard:
        print(f"HARVARD FOUND: Sticker=${harvard.get('sticker_price')} Net=${harvard.get('net_price')}")
    else:
        print("Harvard not found in top 100")
except Exception as e:
    print(f"Error: {e}")
