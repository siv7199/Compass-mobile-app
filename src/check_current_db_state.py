import sqlite3
import pandas as pd

conn = sqlite3.connect(r'..\database\compass.db')

# 1. Check Sticker Price Distribution
print("--- STICKER PRICE AUDIT ---")
df = pd.read_sql_query("SELECT sticker_price FROM schools", conn)
total = len(df)
nulls = df['sticker_price'].isnull().sum()
zeros = (df['sticker_price'] == 0).sum()
defaults_42k = (df['sticker_price'] == 42000).sum()
defaults_72k = (df['sticker_price'] == 72000).sum()
real_values = total - nulls - zeros - defaults_42k - defaults_72k

print(f"Total Schools: {total}")
print(f"NULLs: {nulls} ({nulls/total:.1%})")
print(f"Zeros: {zeros} ({zeros/total:.1%})")
print(f"Old Heuristic (42k): {defaults_42k}")
print(f"Old Heuristic (72k): {defaults_72k}")
print(f"New 'Real' Data: {real_values}")

# 2. Sample 'Real' Data
print("\n--- SAMPLE REAL DATA ---")
cursor = conn.cursor()
cursor.execute("SELECT INSTNM, sticker_price FROM schools WHERE sticker_price NOT IN (42000, 72000, 0) AND sticker_price IS NOT NULL LIMIT 10")
for row in cursor.fetchall():
    print(row)

conn.close()
