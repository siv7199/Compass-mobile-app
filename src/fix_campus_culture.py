"""
Fix HBCU, Greek Life, and Diversity Index population
"""
import sqlite3
import pandas as pd
import os
import numpy as np

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'compass.db')
DATA_DIR = os.path.join(BASE_DIR, '..', 'data', 'campus_culture')

def fix_hbcu():
    """Update HBCU from hd2024.csv"""
    print("\n[1] Fixing HBCU...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    csv_path = os.path.join(DATA_DIR, 'hd2024.csv')
    df = pd.read_csv(csv_path, encoding='latin1', usecols=['UNITID', 'HBCU'])
    
    # Get only HBCU=1 schools
    hbcu_schools = df[df['HBCU'] == 1]['UNITID'].tolist()
    print(f"  HBCUs in CSV: {len(hbcu_schools)}")
    
    # Update each one
    updated = 0
    for unitid in hbcu_schools:
        cursor.execute("UPDATE schools SET HBCU = 1 WHERE UNITID = ?", (int(unitid),))
        if cursor.rowcount > 0:
            updated += 1
    
    # Set others to 2 (not HBCU)
    cursor.execute("UPDATE schools SET HBCU = 2 WHERE HBCU IS NULL")
    
    conn.commit()
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HBCU = 1")
    result = cursor.fetchone()[0]
    print(f"  HBCUs in database: {result}")
    
    # Show sample HBCU schools
    cursor.execute("SELECT INSTNM FROM schools WHERE HBCU = 1 LIMIT 5")
    print("  Sample HBCUs:")
    for row in cursor.fetchall():
        print(f"    - {row[0]}")
    
    conn.close()

def fix_greek_life():
    """Update Greek Life by exact name matching"""
    print("\n[2] Fixing Greek Life...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    xlsx_path = os.path.join(DATA_DIR, 'Greek Life Data.xlsx')
    df = pd.read_excel(xlsx_path)
    
    # Clean column name (misspelled in source)
    if 'nstitution' in df.columns:
        df = df.rename(columns={'nstitution': 'Institution'})
    
    updated = 0
    for _, row in df.iterrows():
        inst_name = str(row.get('Institution', '')).strip()
        if not inst_name or inst_name == '-' or inst_name == 'nan':
            continue
        
        has_frat = row.get('Fraternities (Yes/No)', 'No')
        has_greek = 1 if has_frat == 'Yes' else 0
        
        pct_frat = row.get('% Fraternity', 0)
        try:
            greek_pct = float(pct_frat) if pct_frat and pct_frat != '-' else 0
        except:
            greek_pct = 0
        
        # Try exact match first
        cursor.execute(
            "UPDATE schools SET HAS_GREEK = ?, GREEK_PCT = ? WHERE INSTNM = ?",
            (has_greek, greek_pct, inst_name)
        )
        if cursor.rowcount > 0:
            updated += 1
        else:
            # Try contains match
            cursor.execute(
                "UPDATE schools SET HAS_GREEK = ?, GREEK_PCT = ? WHERE INSTNM LIKE ?",
                (has_greek, greek_pct, f"%{inst_name}%")
            )
            if cursor.rowcount > 0:
                updated += 1
    
    conn.commit()
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_GREEK = 1")
    result = cursor.fetchone()[0]
    print(f"  Schools with Greek Life: {result}")
    
    conn.close()

def fix_diversity():
    """Calculate diversity index from enrollment data"""
    print("\n[3] Fixing Diversity Index...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    csv_path = os.path.join(DATA_DIR, 'ef2024a.csv')
    
    # Read all data - this file has enrollment by race
    df = pd.read_csv(csv_path, encoding='latin1', low_memory=False)
    
    print(f"  Columns sample: {list(df.columns)[:10]}")
    
    # Filter to get total enrollment rows (usually EFALEVEL=1 or LINE=1)
    if 'EFALEVEL' in df.columns:
        df = df[df['EFALEVEL'] == 1]
    if 'LINE' in df.columns:
        df = df[df['LINE'] == 1]
    
    # Race columns: EFWHITT (White), EFBKAAT (Black), EFHISPT (Hispanic), 
    # EFASIAT (Asian), EFAIANT (Am Indian), EFNHPIT (Pacific), EF2MORT (Two+)
    race_cols = ['EFWHITT', 'EFBKAAT', 'EFHISPT', 'EFASIAT', 'EFAIANT', 'EFNHPIT', 'EF2MORT']
    available_cols = [c for c in race_cols if c in df.columns]
    
    print(f"  Available race columns: {available_cols}")
    
    if not available_cols:
        print("  No race columns found!")
        conn.close()
        return
    
    updated = 0
    for unitid in df['UNITID'].unique():
        school_df = df[df['UNITID'] == unitid]
        
        totals = []
        for col in available_cols:
            val = school_df[col].sum()
            if pd.notna(val) and val > 0:
                totals.append(float(val))
        
        if len(totals) >= 2 and sum(totals) > 0:
            total = sum(totals)
            proportions = [t/total for t in totals]
            # Simpson's Diversity Index: 1 - sum(p^2)
            diversity = 1 - sum(p**2 for p in proportions)
            
            cursor.execute(
                "UPDATE schools SET DIVERSITY_INDEX = ? WHERE UNITID = ?",
                (round(diversity, 4), int(unitid))
            )
            if cursor.rowcount > 0:
                updated += 1
    
    conn.commit()
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE DIVERSITY_INDEX IS NOT NULL")
    result = cursor.fetchone()[0]
    cursor.execute("SELECT AVG(DIVERSITY_INDEX) FROM schools WHERE DIVERSITY_INDEX IS NOT NULL")
    avg = cursor.fetchone()[0] or 0
    print(f"  Schools with Diversity Index: {result}")
    print(f"  Average Diversity: {avg:.3f}")
    
    conn.close()

def main():
    print("=" * 50)
    print("CAMPUS CULTURE DATA FIX")
    print("=" * 50)
    
    fix_hbcu()
    fix_greek_life()
    fix_diversity()
    
    # Final summary
    print("\n" + "=" * 50)
    print("FINAL SUMMARY")
    print("=" * 50)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HBCU = 1")
    print(f"HBCUs: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_GREEK = 1")
    print(f"Greek Life: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_SPORTS = 1")
    print(f"Sports: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE DIVERSITY_INDEX IS NOT NULL")
    print(f"Diversity Index: {cursor.fetchone()[0]}")
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE LOCALE IS NOT NULL")
    print(f"Locale: {cursor.fetchone()[0]}")
    
    conn.close()
    print("\nDone!")

if __name__ == "__main__":
    main()
