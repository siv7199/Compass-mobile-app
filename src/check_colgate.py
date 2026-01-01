import sqlite3
import os

DB_NAME = r'database\compass.db'
if not os.path.exists(DB_NAME):
    DB_NAME = r'..\database\compass.db'

conn = sqlite3.connect(DB_NAME)
c = conn.cursor()
c.execute("SELECT UNITID, INSTNM, sticker_price FROM schools WHERE INSTNM LIKE '%Colgate%'")
rows = c.fetchall()
for r in rows:
    print(r)
conn.close()
