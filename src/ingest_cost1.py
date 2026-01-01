import pandas as pd
import sqlite3
import os

DB_PATH = r'..\database\compass.db'
# cost1_2024.csv contains Student Charges (Tuition, etc.)
COST_PATH = r'..\data\ipeds\cost1_2024.csv'

def ingest_costs():
    print("--- STARTING LOCAL COST INGESTION (cost1_2024) ---")
    
    if not os.path.exists(COST_PATH):
        print(f"Error: {COST_PATH} not found.")
        return

    # Key Columns based on Dictionary Scan:
    # TUITION2 = In-district/In-state (often same for public)
    # TUITION3 = Out-of-state (Use this as base for "Sticker Price")
    # CHG4AY3  = Room and Board (On Campus)
    # CHG1AY3  = Books and Supplies
    
    cols = ['UNITID', 'TUITION2', 'TUITION3', 'CHG4AY3', 'CHG1AY3']
    
    try:
        # Load only necessary columns
        df = pd.read_csv(COST_PATH, usecols=lambda c: c.upper() in cols)
        df.columns = df.columns.str.upper() # Normalize
        
        print(f"Loaded {len(df)} rows.")

        # Force numeric
        for col in ['TUITION3', 'TUITION2', 'CHG4AY3', 'CHG1AY3']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        def calc_sticker(row):
            # Prefer Out-of-State Tuition
            tuition = row['TUITION3'] if pd.notnull(row['TUITION3']) else row['TUITION2']
            
            if pd.isnull(tuition): return None
            
            room = row['CHG4AY3'] if pd.notnull(row['CHG4AY3']) else 14000 # Fallback 14k
            books = row['CHG1AY3'] if pd.notnull(row['CHG1AY3']) else 1200 # Fallback 1.2k
            
            # Additional Fees (FEE3) often missing, so just Tuition + R&B + Books is solid
            return tuition + room + books

        df['sticker_price'] = df.apply(calc_sticker, axis=1)
        
        # Prepare for DB
        updates = df[df['sticker_price'].notnull()][['sticker_price', 'UNITID']]
        print(f"Found {len(updates)} valid sticker prices.")
        
        if updates.empty:
            print("No updates found.")
            return

        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        data = list(updates.itertuples(index=False, name=None))
        c.executemany("UPDATE schools SET sticker_price = ? WHERE unitid = ?", data)
        conn.commit()
        
        # Verify
        c.execute("SELECT count(*) FROM schools WHERE sticker_price IS NOT NULL AND sticker_price > 0")
        cnt = c.fetchone()[0]
        print(f"DB Update Complete. Total Schools with Price: {cnt}")
        
        conn.close()
        
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    ingest_costs()
