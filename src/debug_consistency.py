import bls_service
import sys

print("--- DEBUGGING BLS CONSISTENCY ---")

errors = 0
for class_id, codes in bls_service.CAREER_MAP.items():
    print(f"Checking Class: {class_id}")
    for code in codes:
        # Get Expected
        if code not in bls_service.VERIFIED_DATA:
            print(f"[ERROR] Code {code} in MAP but Not in DATA!")
            errors += 1
            continue
            
        expected = bls_service.VERIFIED_DATA[code]
        
        # Get Actual (Fetch Boss Stats)
        actual = bls_service.fetch_boss_stats(code)
        
        # Compare
        wage_ok = actual['annual_mean_wage'] == expected['wage']
        growth_ok = actual['projected_growth'] == expected['growth']
        
        if not wage_ok or not growth_ok:
            print(f"[FAIL] {code}: Expected {expected['wage']}/{expected['growth']} -> Got {actual['annual_mean_wage']}/{actual['projected_growth']}")
            print(f"       Source: {actual['source']}")
            errors += 1
        else:
            # print(f"[OK] {code}")
            pass

if errors == 0:
    print("SUCCESS: All mapped careers return Verified Data correctly.")
else:
    print(f"FAILURE: Found {errors} inconsistencies.")
    sys.exit(1)
