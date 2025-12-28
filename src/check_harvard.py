import sqlite3

def check():
    conn = sqlite3.connect(r'..\database\compass.db')
    c = conn.cursor()
    c.execute("""
        SELECT s.UNITID, s.INSTNM, a.SATVR75, a.SATMT75, s.NET_PRICE, s.ADM_RATE 
        FROM schools s
        LEFT JOIN admissions a ON s.UNITID = a.UNITID 
        WHERE s.INSTNM LIKE '%Harvard%'
    """)
    for r in c.fetchall():
        print(r)
    conn.close()

if __name__ == "__main__":
    check()
