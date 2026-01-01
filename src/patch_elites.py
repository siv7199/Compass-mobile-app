import sqlite3
import os

DB_NAME = r'database\compass.db'
if not os.path.exists(DB_NAME):
    DB_NAME = r'..\database\compass.db'

# Verified 2023-24 Cost of Attendance (Sticker Price)
ELITES = {
    'Harvard University': 82866,
    'Stanford University': 87833,
    'Yale University': 87705,
    'Princeton University': 83140,
    'Massachusetts Institute of Technology': 82730
}

conn = sqlite3.connect(DB_NAME)
c = conn.cursor()

print("Patching Elite School Costs...")

for school, price in ELITES.items():
    c.execute("UPDATE schools SET STICKER_PRICE = ? WHERE INSTNM = ?", (price, school))
    if c.rowcount > 0:
        print(f"Updated {school} -> ${price}")
    else:
        print(f"Warning: Could not find {school}")

conn.commit()
conn.close()
print("Patch Complete.")
