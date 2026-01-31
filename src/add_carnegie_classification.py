"""
Add Carnegie Classification (C21BASIC) to the schools table.
- Code 15: R1 (Very High Research)
- Code 16: R2 (High Research)
"""
import sqlite3
import pandas as pd
import os

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'compass.db')
CSV_PATH = os.path.join(BASE_DIR, '..', 'data', 'ipeds', 'hd2024.csv')

def add_carnegie_column():
    """Add C21BASIC column and populate from hd2024.csv"""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Step 1: Add column if not exists
    try:
        cursor.execute("ALTER TABLE schools ADD COLUMN C21BASIC INTEGER")
        print("Added C21BASIC column to schools table")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e).lower():
            print("C21BASIC column already exists")
        else:
            raise e
    
    # Step 2: Read CSV - C21BASIC uses values 15 (R1) and 16 (R2)
    print(f"Reading from: {CSV_PATH}")
    df = pd.read_csv(CSV_PATH, encoding='latin1', usecols=['UNITID', 'C21BASIC'])
    
    # Count R1/R2 in CSV
    r1_csv = len(df[df['C21BASIC'] == 15])
    r2_csv = len(df[df['C21BASIC'] == 16])
    print(f"CSV contains: R1={r1_csv}, R2={r2_csv}")
    
    # Step 3: Update R1 schools (C21BASIC = 15)
    r1_schools = df[df['C21BASIC'] == 15]['UNITID'].tolist()
    updated_r1 = 0
    for unitid in r1_schools:
        cursor.execute(
            "UPDATE schools SET C21BASIC = 15 WHERE UNITID = ?",
            (int(unitid),)
        )
        if cursor.rowcount > 0:
            updated_r1 += 1
    
    # Step 4: Update R2 schools (C21BASIC = 16)
    r2_schools = df[df['C21BASIC'] == 16]['UNITID'].tolist()
    updated_r2 = 0
    for unitid in r2_schools:
        cursor.execute(
            "UPDATE schools SET C21BASIC = 16 WHERE UNITID = ?",
            (int(unitid),)
        )
        if cursor.rowcount > 0:
            updated_r2 += 1
    
    conn.commit()
    
    # Step 5: Verify results
    cursor.execute("SELECT COUNT(*) FROM schools WHERE C21BASIC = 15")
    r1_count = cursor.fetchone()[0]
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE C21BASIC = 16")
    r2_count = cursor.fetchone()[0]
    
    print(f"\n=== RESULTS ===")
    print(f"R1 Universities (Very High Research): {r1_count} (updated {updated_r1})")
    print(f"R2 Universities (High Research): {r2_count} (updated {updated_r2})")
    
    # Show sample R1 schools
    cursor.execute("SELECT INSTNM FROM schools WHERE C21BASIC = 15 LIMIT 5")
    print("\nSample R1 Universities:")
    for row in cursor.fetchall():
        print(f"  - {row[0]}")
    
    conn.close()
    print("\nDone!")

if __name__ == "__main__":
    add_carnegie_column()
