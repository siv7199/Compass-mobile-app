import sqlite3

conn = sqlite3.connect(r'..\database\compass.db')
c = conn.cursor()

c.execute("""
    SELECT count(*) 
    FROM schools 
    WHERE sticker_price != 42000 
      AND sticker_price != 72000 
      AND sticker_price IS NOT NULL
""")
updated_count = c.fetchone()[0]

print(f"Schools with REAL prices (not 42k/72k): {updated_count}")

c.execute("""
    SELECT INSTNM, sticker_price 
    FROM schools 
    WHERE sticker_price != 42000 
      AND sticker_price != 72000 
    LIMIT 5
""")
for row in c.fetchall():
    print(row)

conn.close()
