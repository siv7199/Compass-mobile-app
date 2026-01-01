import sqlite3
import pandas as pd

conn = sqlite3.connect(r'..\database\compass.db')
c = conn.cursor()

# Check variance
print("--- PRICE VARIANCE CHECK ---")
c.execute("""
    SELECT sticker_price, count(*) 
    FROM schools 
    GROUP BY sticker_price 
    ORDER BY count(*) DESC 
    LIMIT 10
""")
for row in c.fetchall():
    print(f"Price: ${row[0]} | Schools: {row[1]}")

# Check sample of Public Schools
print("\n--- PUBLIC SCHOOLS SAMPLE ---")
# Assuming we can join or just check known public constants if we don't have control col in DB
# We'll just look at names that sound public
c.execute("""
    SELECT INSTNM, sticker_price 
    FROM schools 
    WHERE INSTNM LIKE '%State University%' 
    LIMIT 5
""")
for row in c.fetchall():
    print(row)

conn.close()
