import sqlite3
import os

DB_NAME = r'database\compass.db'
if not os.path.exists(DB_NAME):
    DB_NAME = r'..\database\compass.db'

conn = sqlite3.connect(DB_NAME)
c = conn.cursor()

print("Patching Global Missing Sticker Prices...")

# HEURISTIC:
# If official Sticker Price is missing:
# Estimate it as Net Price + $20,000 (Avg Aid/Grants gap).
# This ensures "Cost to Acquire" is always significantly higher than "Net Cost".
# Also enforce a hard floor of $25,000 for game balance.

c.execute("""
    UPDATE schools 
    SET STICKER_PRICE = MAX(COALESCE(NET_PRICE, 0) + 20000, 25000)
    WHERE STICKER_PRICE IS NULL OR STICKER_PRICE = 0
""")

print(f"Patched {c.rowcount} schools with estimated Sticker Price.")

conn.commit()
conn.close()
