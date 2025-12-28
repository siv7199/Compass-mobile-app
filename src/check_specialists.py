import sqlite3

def check_specialists():
    conn = sqlite3.connect(r'..\database\compass.db')
    c = conn.cursor()
    
    names = ['Massachusetts Institute of Technology', 'California Institute of Technology', 'Harvey Mudd', 'Rhode Island School of Design']
    
    print("Checking Specialists...")
    for name in names:
        c.execute("SELECT UNITID, INSTNM, EARNINGS_MEDIAN, ADM_RATE FROM schools WHERE INSTNM LIKE ?", (f"%{name}%",))
        row = c.fetchone()
        if row:
            print(f"FOUND: {row}")
        else:
            print(f"MISSING: {name}")
            
    conn.close()

if __name__ == "__main__":
    check_specialists()
