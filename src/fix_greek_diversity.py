"""
Debug and fix Greek Life and Diversity population
"""
import sqlite3
import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, 'compass.db')
DATA_DIR = os.path.join(BASE_DIR, '..', 'data', 'campus_culture')

def fix_greek_life():
    """Fix Greek Life matching"""
    print("=" * 50)
    print("FIXING GREEK LIFE")
    print("=" * 50)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    xlsx_path = os.path.join(DATA_DIR, 'Greek Life Data.xlsx')
    df = pd.read_excel(xlsx_path)
    
    print(f"Columns: {list(df.columns)}")
    print(f"Total rows: {len(df)}")
    
    # Get column with institution name (misspelled as 'nstitution')
    inst_col = 'nstitution' if 'nstitution' in df.columns else 'Institution'
    frat_col = 'Fraternities (Yes/No)'
    
    # Get all school names from database for matching
    cursor.execute("SELECT UNITID, INSTNM FROM schools")
    db_schools = {row[1].lower(): row[0] for row in cursor.fetchall()}
    
    updated = 0
    matched_names = []
    
    for _, row in df.iterrows():
        inst_name = str(row.get(inst_col, '')).strip()
        if not inst_name or inst_name == '-' or inst_name == 'nan':
            continue
        
        has_frat = row.get(frat_col, 'No')
        has_greek = 1 if has_frat == 'Yes' else 0
        
        pct_frat = row.get('% Fraternity', 0)
        try:
            if isinstance(pct_frat, str):
                pct_frat = pct_frat.replace('%', '').strip()
            greek_pct = float(pct_frat) if pct_frat and pct_frat != '-' else 0
        except:
            greek_pct = 0
        
        # Try to find matching school
        inst_lower = inst_name.lower()
        
        # Exact match
        if inst_lower in db_schools:
            unitid = db_schools[inst_lower]
            cursor.execute(
                "UPDATE schools SET HAS_GREEK = ?, GREEK_PCT = ? WHERE UNITID = ?",
                (has_greek, greek_pct, unitid)
            )
            if cursor.rowcount > 0:
                updated += 1
                matched_names.append(inst_name)
        else:
            # Fuzzy match - find schools containing this name
            for db_name, unitid in db_schools.items():
                if inst_lower in db_name or db_name in inst_lower:
                    cursor.execute(
                        "UPDATE schools SET HAS_GREEK = ?, GREEK_PCT = ? WHERE UNITID = ?",
                        (has_greek, greek_pct, unitid)
                    )
                    if cursor.rowcount > 0:
                        updated += 1
                        matched_names.append(inst_name)
                    break
    
    conn.commit()
    
    cursor.execute("SELECT COUNT(*) FROM schools WHERE HAS_GREEK = 1")
    result = cursor.fetchone()[0]
    print(f"\nUpdated {updated} schools")
    print(f"Schools with Greek Life in DB: {result}")
    print(f"\nSample matched: {matched_names[:5]}")
    
    conn.close()

def fix_diversity():
    """Fix diversity index calculation"""
    print("\n" + "=" * 50)
    print("FIXING DIVERSITY INDEX")
    print("=" * 50)
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    csv_path = os.path.join(DATA_DIR, 'ef2024a.csv')
    df = pd.read_csv(csv_path, encoding='latin1', low_memory=False)
    
    print(f"Total rows: {len(df)}")
    print(f"Sample columns: {list(df.columns)[:20]}")
    
    # Check what columns we have
    ef_cols = [c for c in df.columns if c.startswith('EF')]
    print(f"EF columns: {ef_cols}")
    
    # Try to find race/ethnicity total columns
    # Format might be EFRACE## where ## is a race code
    race_pattern_cols = [c for c in df.columns if 'RACE' in c.upper() or 'HISP' in c.upper() or 'WHIT' in c.upper() or 'BKAA' in c.upper() or 'ASIA' in c.upper()]
    print(f"Race-related columns: {race_pattern_cols}")
    
    # Alternative: look for total enrollment columns by race
    # IPEDS ef2024a typically has columns like EFRACE01-EFRACE24 for different race categories
    
    if 'EFRACE01' in df.columns:
        # Use EFRACE columns (race/ethnicity codes)
        race_cols = [f'EFRACE{str(i).zfill(2)}' for i in range(1, 25) if f'EFRACE{str(i).zfill(2)}' in df.columns]
        print(f"Using EFRACE columns: {race_cols}")
    else:
        # Try alternative column naming
        race_cols = [c for c in df.columns if c.startswith('EF') and c.endswith('T') and len(c) > 5]
        print(f"Using alternative columns: {race_cols[:10]}")
    
    if not race_cols:
        print("No suitable race columns found!")
        conn.close()
        return
    
    # Get unique schools
    unitids = df['UNITID'].unique()
    print(f"Unique schools in data: {len(unitids)}")
    
    updated = 0
    for unitid in unitids[:100]:  # Test with first 100
        school_df = df[df['UNITID'] == unitid]
        
        totals = []
        for col in race_cols[:7]:  # Use first 7 race categories
            if col in school_df.columns:
                val = pd.to_numeric(school_df[col], errors='coerce').sum()
                if pd.notna(val) and val > 0:
                    totals.append(float(val))
        
        if len(totals) >= 2 and sum(totals) > 0:
            total = sum(totals)
            proportions = [t/total for t in totals]
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
    print(f"\nUpdated {updated} schools (tested first 100)")
    print(f"Schools with Diversity Index: {result}")
    
    conn.close()

if __name__ == "__main__":
    fix_greek_life()
    fix_diversity()
    print("\nDone!")
