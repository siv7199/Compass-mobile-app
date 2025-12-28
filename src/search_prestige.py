import sqlite3

def check_elite_schools():
    conn = sqlite3.connect(r'..\database\compass.db')
    c = conn.cursor()
    
    print("Checking for Elite Schools...")
    try:
        c.execute("SELECT INSTNM, ADM_RATE, SATVR75, SATMT75 FROM schools JOIN admissions ON schools.UNITID = admissions.UNITID WHERE INSTNM LIKE '%Stanford%' OR INSTNM LIKE '%Harvard%' OR INSTNM LIKE '%Yale%'")
        results = c.fetchall()
        
        if not results:
            print("ALERT: No Elite schools found in database!")
        else:
            print(f"Found {len(results)} schools:")
            for row in results:
                print(row)
                
    except Exception as e:
        print(f"Error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    check_elite_schools()
