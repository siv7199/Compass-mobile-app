import sqlite3

conn = sqlite3.connect('src/compass.db')
c = conn.cursor()

# Check if mapping exists
c.execute("SELECT * FROM major_to_career WHERE SOC_PREFIX = '13' AND CIP_PREFIX = '52'")
if not c.fetchone():
    print("Adding mapping for SOC 13 -> CIP 52")
    c.execute("INSERT INTO major_to_career (CIP_PREFIX, SOC_PREFIX) VALUES ('52', '13')")
    conn.commit()
    print("Mapping added.")
else:
    print("Mapping already exists.")

conn.close()
