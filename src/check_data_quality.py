import sqlite3

conn = sqlite3.connect(r'..\database\compass.db')
c = conn.cursor()

c.execute("SELECT count(*) FROM schools")
total = c.fetchone()[0]

c.execute("SELECT count(*) FROM schools WHERE NET_PRICE > 0")
net_price_count = c.fetchone()[0]

c.execute("SELECT count(*) FROM schools WHERE sticker_price > 0")
sticker_price_count = c.fetchone()[0]

print(f"Total Schools: {total}")
print(f"Schools with Valid Net Price: {net_price_count}")
print(f"Schools with Valid Sticker Price: {sticker_price_count}")

c.execute("SELECT INSTNM, net_price, sticker_price FROM schools LIMIT 5")
for row in c.fetchall():
    print(row)

conn.close()
