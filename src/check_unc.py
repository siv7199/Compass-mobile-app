import sqlite3

def check_unc():
    conn = sqlite3.connect(r'..\database\compass.db')
    c = conn.cursor()
    
    print("Checking for UNC Chapel Hill...")
    c.execute("SELECT UNITID, INSTNM, EARNINGS_MEDIAN, ADM_RATE, NET_PRICE FROM schools WHERE INSTNM LIKE '%Chapel Hill%'")
    results = c.fetchall()
    
    if not results:
        print("MISSING: UNC Chapel Hill not found in DB.")
    else:
        for r in results:
            print(f"FOUND: {r}")
            
    conn.close()

if __name__ == "__main__":
    check_unc()
