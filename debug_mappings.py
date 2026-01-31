import sqlite3
import pandas as pd

conn = sqlite3.connect('src/compass.db')
query = "SELECT * FROM major_to_career"
df = pd.read_sql_query(query, conn)
print(df)
conn.close()
