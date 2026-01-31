"""
Add Campus Culture data to the schools table.
Includes: HBCU, LOCALE, Greek Life, Sports, Diversity Index
"""
import sqlite3
import pandas as pd
import os
import numpy as np

# Paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'compass.db')
DATA_DIR = os.path.join(BASE_DIR, '..', 'data', 'campus_culture')

def add_columns(cursor):
    """Add all campus culture columns to schools table"""
    columns = [
        ("HBCU", "INTEGER"),
        ("LOCALE", "INTEGER"),
        ("HAS_GREEK", "INTEGER"),
        ("GREEK_PCT", "REAL"),
        ("HAS_SPORTS", "INTEGER"),
        ("DIVERSITY_INDEX", "REAL"),
    ]
    
    for col_name, col_type in columns:
        try:
            cursor.execute(f"ALTER TABLE schools ADD COLUMN {col_name} {col_type}")
            print(f"  Added column: {col_name}")
        except sqlite3.OperationalError as e:
            if "duplicate column" in str(e).lower():
                print(f"  Column {col_name} already exists")
            else:
                raise e

def add_hbcu_and_locale(cursor):
    """Add HBCU and LOCALE from hd2024.csv"""
    print("\n[1] Adding HBCU and LOCALE...")
    
    csv_path = os.path.join(DATA_DIR, 'hd2024.csv')
    df = pd.read_csv(csv_path, encoding='latin1', usecols=['UNITID', 'HBCU', 'LOCALE'])
    
    updated = 0
    for _, row in df.iterrows():
        unitid = row['UNITID']
        hbcu = row['HBCU'] if pd.notna(row['HBCU']) else None
        locale = row['LOCALE'] if pd.notna(row['LOCALE']) else None
        
        cursor.execute(
            "UPDATE schools SET HBCU = ?, LOCALE = ? WHERE UNITID = ?",
            (hbcu, locale, unitid)
        )
        if cursor.rowcount > 0:
            updated += 1
    
    # Verify
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HBCU = 1")
    hbcu_count = cursor.fetchone()[0]
    print(f"  Updated {updated} schools")
    print(f"  HBCUs found: {hbcu_count}")

def add_greek_life(cursor):
    """Add Greek Life data from Greek Life Data.xlsx"""
    print("\n[2] Adding Greek Life data...")
    
    xlsx_path = os.path.join(DATA_DIR, 'Greek Life Data.xlsx')
    df = pd.read_excel(xlsx_path)
    
    # Columns: 'nstitution', 'Fraternities (Yes/No)', 'Sororities (Yes/No)', '% Fraternity', '% Sorority'
    # Note: First column name is misspelled as 'nstitution'
    
    updated = 0
    for _, row in df.iterrows():
        inst_name = row.get('nstitution', row.get('Institution', ''))
        if not inst_name or inst_name == '-':
            continue
            
        has_frat = row.get('Fraternities (Yes/No)', 'No')
        has_soror = row.get('Sororities (Yes/No)', 'No')
        pct_frat = row.get('% Fraternity', 0)
        pct_soror = row.get('% Sorority', 0)
        
        # Calculate HAS_GREEK and GREEK_PCT
        has_greek = 1 if has_frat == 'Yes' or has_soror == 'Yes' else 0
        
        # Handle percentage values
        try:
            pct_frat = float(pct_frat) if pct_frat and pct_frat != '-' else 0
            pct_soror = float(pct_soror) if pct_soror and pct_soror != '-' else 0
        except:
            pct_frat = 0
            pct_soror = 0
        
        greek_pct = max(pct_frat, pct_soror)
        
        # Update by name match (fuzzy)
        cursor.execute(
            "UPDATE schools SET HAS_GREEK = ?, GREEK_PCT = ? WHERE INSTNM LIKE ?",
            (has_greek, greek_pct, f"%{inst_name}%")
        )
        if cursor.rowcount > 0:
            updated += 1
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_GREEK = 1")
    greek_count = cursor.fetchone()[0]
    print(f"  Updated {updated} schools with Greek Life data")
    print(f"  Schools with Greek Life: {greek_count}")

def add_sports(cursor):
    """Add sports flag from EADA_2024.xlsx"""
    print("\n[3] Adding Sports data...")
    
    xlsx_path = os.path.join(DATA_DIR, 'EADA_2024.xlsx')
    try:
        df = pd.read_excel(xlsx_path, usecols=['unitid'])
        
        # Any school in EADA has sports
        updated = 0
        for unitid in df['unitid'].unique():
            cursor.execute(
                "UPDATE schools SET HAS_SPORTS = 1 WHERE UNITID = ?",
                (int(unitid),)
            )
            if cursor.rowcount > 0:
                updated += 1
        
        cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_SPORTS = 1")
        sports_count = cursor.fetchone()[0]
        print(f"  Updated {updated} schools with Sports flag")
        print(f"  Schools with Sports: {sports_count}")
    except Exception as e:
        print(f"  Error loading EADA data: {e}")

def calculate_diversity_index(cursor):
    """Calculate diversity index from ef2024a.csv enrollment demographics"""
    print("\n[4] Calculating Diversity Index...")
    
    csv_path = os.path.join(DATA_DIR, 'ef2024a.csv')
    
    # Read relevant columns - race/ethnicity breakdowns
    # EFRACE columns typically have race breakdowns
    try:
        df = pd.read_csv(csv_path, encoding='latin1', low_memory=False)
        
        # Filter to total enrollment (EFALEVEL=1 typically)
        if 'EFALEVEL' in df.columns:
            df = df[df['EFALEVEL'] == 1]
        
        # Look for race columns - common patterns
        race_cols = [c for c in df.columns if any(x in c for x in ['EFWHITT', 'EFBKAAT', 'EFHISPT', 'EFASIAT', 'EFAIANT', 'EFNHPIT', 'EF2MORT'])]
        
        if not race_cols:
            # Try alternative column names
            race_cols = [c for c in df.columns if 'EF' in c and 'T' in c and len(c) > 4][:7]
        
        print(f"  Using race columns: {race_cols[:5]}...")
        
        updated = 0
        for unitid in df['UNITID'].unique():
            school_df = df[df['UNITID'] == unitid]
            
            if len(school_df) == 0:
                continue
            
            # Sum up race/ethnicity totals
            totals = []
            for col in race_cols:
                val = school_df[col].sum()
                if pd.notna(val) and val > 0:
                    totals.append(val)
            
            if len(totals) < 2:
                continue
            
            # Calculate Simpson's Diversity Index
            total = sum(totals)
            if total > 0:
                proportions = [t/total for t in totals]
                # Simpson's D = 1 - sum(p^2)
                diversity = 1 - sum(p**2 for p in proportions)
                
                cursor.execute(
                    "UPDATE schools SET DIVERSITY_INDEX = ? WHERE UNITID = ?",
                    (round(diversity, 4), int(unitid))
                )
                if cursor.rowcount > 0:
                    updated += 1
        
        cursor.execute("SELECT COUNT(*) FROM schools WHERE DIVERSITY_INDEX IS NOT NULL")
        div_count = cursor.fetchone()[0]
        cursor.execute("SELECT AVG(DIVERSITY_INDEX) FROM schools WHERE DIVERSITY_INDEX IS NOT NULL")
        avg_div = cursor.fetchone()[0]
        print(f"  Updated {updated} schools with Diversity Index")
        print(f"  Schools with index: {div_count}, Average: {avg_div:.3f}")
        
    except Exception as e:
        print(f"  Error calculating diversity: {e}")

def main():
    print("=" * 50)
    print("CAMPUS CULTURE DATA INTEGRATION")
    print("=" * 50)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    print("\nAdding columns to schools table...")
    add_columns(cursor)
    conn.commit()
    
    add_hbcu_and_locale(cursor)
    conn.commit()
    
    add_greek_life(cursor)
    conn.commit()
    
    add_sports(cursor)
    conn.commit()
    
    calculate_diversity_index(cursor)
    conn.commit()
    
    # Final summary
    print("\n" + "=" * 50)
    print("SUMMARY")
    print("=" * 50)
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HBCU = 1")
    print(f"HBCUs: {cursor.fetchone()[0]}")
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_GREEK = 1")
    print(f"Greek Life: {cursor.fetchone()[0]}")
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_SPORTS = 1")
    print(f"Sports: {cursor.fetchone()[0]}")
    cursor.execute("SELECT COUNT(*) FROM schools WHERE DIVERSITY_INDEX IS NOT NULL")
    print(f"Diversity Index: {cursor.fetchone()[0]}")
    
    conn.close()
    print("\nDone!")

if __name__ == "__main__":
    main()
