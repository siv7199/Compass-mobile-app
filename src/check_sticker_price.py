import sqlite3
import pandas as pd

conn = sqlite3.connect('compass.db')
c = conn.cursor()

# Get a sample of schools
c.execute("""
    SELECT 
        unitid, 
        name, 
        sticker_price, 
        net_price,
        (sticker_price - net_price) as diff
    FROM schools 
    WHERE sticker_price > 0
    LIMIT 10
""")

print("--- SCHOOLS WITH STICKER PRICE ---")
for row in c.fetchall():
    print(row)

c.execute("""
    SELECT count(*) FROM schools WHERE sticker_price IS NULL OR sticker_price = 0
""")
missing = c.fetchone()[0]
print(f"\n--- MISSING STICKER PRICES: {missing} ---")

conn.close()
