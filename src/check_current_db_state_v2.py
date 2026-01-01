import sqlite3
import time

try:
    conn = sqlite3.connect(r'..\database\compass.db')
    c = conn.cursor()
    
    # Check total
    c.execute("SELECT count(*) FROM schools")
    total = c.fetchone()[0]
    
    # Check Nulls
    c.execute("SELECT count(*) FROM schools WHERE sticker_price IS NULL")
    nulls = c.fetchone()[0]
    
    # Check Zeros
    c.execute("SELECT count(*) FROM schools WHERE sticker_price = 0")
    zeros = c.fetchone()[0]
    
    # Check Heuristics
    c.execute("SELECT count(*) FROM schools WHERE sticker_price = 42000")
    h_42k = c.fetchone()[0]
    
    c.execute("SELECT count(*) FROM schools WHERE sticker_price = 72000")
    h_72k = c.fetchone()[0]
    
    real = total - nulls - zeros - h_42k - h_72k
    
    print(f"Total: {total}")
    print(f"Nulls: {nulls}")
    print(f"Zeros: {zeros}")
    print(f"Heuristic (42k): {h_42k}")
    print(f"Heuristic (72k): {h_72k}")
    print(f"Real Data: {real}")
    
    # Sample Real
    print("\n-- Sample Real --")
    c.execute("SELECT INSTNM, sticker_price FROM schools WHERE sticker_price NOT IN (42000, 72000, 0) AND sticker_price IS NOT NULL LIMIT 5")
    for r in c.fetchall():
        print(r)
        
    conn.close()

except Exception as e:
    print(f"Error: {e}")
