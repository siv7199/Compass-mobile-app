import requests
import json

BLS_API_URL = "https://api.bls.gov/publicAPI/v2/timeseries/data/"
SOC_CODE = "151252" # Software Developers

# Potential Series ID Formats for OES (Occupational Employment Statistics)
# Structure: OE + Seasonality(U) + AreaType(N) + Area(000000) + Industry + Occupation + DataType(04)

variants = [
    f"OEUN00000001{SOC_CODE}04",       # What I tried (Industry '1')
    f"OEUN000000000001{SOC_CODE}04",   # Industry '000001' (Padded?)
    f"OEUN000000000000{SOC_CODE}04",   # Industry '000000' (All Industries?)
    f"OEU0000000000000{SOC_CODE}04",   # Maybe shortened area?
    f"OEUN0000000100000{SOC_CODE}04",  # Maybe Area is longer?
]

headers = {'Content-type': 'application/json'}
data = json.dumps({
    "seriesid": variants,
    "startyear": "2023",
    "endyear": "2024" 
})

print(f"Testing {len(variants)} Series ID variants for SOC {SOC_CODE}...")

try:
    response = requests.post(BLS_API_URL, data=data, headers=headers)
    result = response.json()
    
    print("\n--- RESULTS ---")
    if result['status'] == 'REQUEST_SUCCEEDED':
        for series in result['Results']['series']:
            sid = series['seriesID']
            if 'data' in series and series['data']:
                print(f"[SUCCESS] {sid}: Found {len(series['data'])} data points!")
                print(f"   Latest: {series['data'][0]}")
            else:
                msg = series.get('message', [])
                print(f"[FAIL] {sid}: {msg}")
    else:
        print(f"API Error: {result['message']}")
        
except Exception as e:
    print(f"Script Error: {e}")
