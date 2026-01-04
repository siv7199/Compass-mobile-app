import sqlite3
import os

DB_PATH = r'..\database\compass.db'
ABS_DB_PATH = os.path.abspath(DB_PATH)

print(f"Checking DB at: {ABS_DB_PATH}")
if not os.path.exists(ABS_DB_PATH):
    print("ERROR: Database file NOT FOUND!")
else:
    print("Database file exists.")
    try:
        conn = sqlite3.connect(ABS_DB_PATH)
        c = conn.cursor()
        
        # Check Tables
        c.execute("SELECT Count(*) FROM schools")
        print(f"Schools Count: {c.fetchone()[0]}")
        
        # Check Specific Mapping
        soc = "11-1021.00"
        soc_prefix = soc[:2]
        c.execute("SELECT CIP_PREFIX FROM major_to_career WHERE SOC_PREFIX = ?", (soc_prefix,))
        cip_prefixes = [row[0] for row in c.fetchall()]
        print(f"CIP Prefixes: {cip_prefixes}")
        
        if cip_prefixes:
            placeholders = ','.join('?' * len(cip_prefixes))
            query = f"""
            SELECT count(*)
            FROM schools s
            JOIN programs p ON s.UNITID = p.UNITID
            LEFT JOIN admissions a ON s.UNITID = a.UNITID
            WHERE substr(p.CIPCODE, 1, 2) IN ({placeholders})
            AND s.EARNINGS_MEDIAN IS NOT NULL
            AND s.DEBT_MEDIAN IS NOT NULL
            """
            c.execute(query, cip_prefixes)
            count = c.fetchone()[0]
            print(f"Candidate Count for {soc}: {count}")
            
            # If 0, try without NULL checks
            if count == 0:
                query_loose = f"""
                SELECT count(*)
                FROM schools s
                JOIN programs p ON s.UNITID = p.UNITID
                WHERE substr(p.CIPCODE, 1, 2) IN ({placeholders})
                """
                c.execute(query_loose, cip_prefixes)
                print(f"Candidate Count (Loose) for {soc}: {c.fetchone()[0]}")
        conn.close()
    except Exception as e:
        print(f"DB Error: {e}")

    # Test Logic Function Directly
    import sys
    import os
    sys.path.append(os.getcwd()) # Add src to path
    import compass_logic
    
    print("\n--- Testing find_loadout Logic ---")
    results = compass_logic.find_loadout(3.0, "11-1021.00", 20000, 1200)
    print(f"Logic Results Count: {len(results)}")
    if len(results) > 0:
        print(f"Top 1: {results[0]}")
    else:
        print("Logic returned NO results.")
