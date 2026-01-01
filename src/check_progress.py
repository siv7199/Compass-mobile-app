import sqlite3

conn = sqlite3.connect(r'..\database\compass.db')
c = conn.cursor()

c.execute("SELECT count(*) FROM schools WHERE sticker_price > 45000")
count = c.fetchone()[0]

print(f"Schools with Sticker Price > $45k: {count}")

c.execute("SELECT INSTNM, sticker_price FROM schools WHERE sticker_price > 50000 LIMIT 5")
for row in c.fetchall():
    print(row)

conn.close()
