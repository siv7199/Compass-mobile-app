import sqlite3

conn = sqlite3.connect('compass.db')
c = conn.cursor()

try:
    print("Adding sticker_price column...")
    c.execute("ALTER TABLE schools ADD COLUMN sticker_price INTEGER")
except sqlite3.OperationalError:
    print("Column already exists (or error).")

print("Backfilling sticker_price...")
# Heuristic: Sticker Price is roughly Net Price + 25k (Average Aid)
# This is a temporary fix to make "Hard Mode" numbers visible immediately.
# We will overwrite this with real IPEDS data in the next step if possible.
c.execute("""
    UPDATE schools 
    SET sticker_price = net_price + 25000 
    WHERE sticker_price IS NULL
""")
conn.commit()
print(f"Updated {c.rowcount} rows.")

conn.close()
