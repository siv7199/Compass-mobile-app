import sqlite3

conn = sqlite3.connect('compass.db')
c = conn.cursor()
c.execute("PRAGMA table_info(schools)")
columns = c.fetchall()
conn.close()

print("--- TABLE SCHEMA ---")
for col in columns:
    print(col)
