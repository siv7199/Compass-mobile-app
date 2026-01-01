import pandas as pd
import sqlite3
import os

DB_PATH = r'..\database\compass.db'
IC_PATH = r'..\data\ipeds\ic2024.csv'

def ingest_local_costs():
    print("--- STARTING LOCAL COST INGESTION ---")
    
    if not os.path.exists(IC_PATH):
        print(f"Error: {IC_PATH} not found.")
        return

    # 1. Read CSV with specific columns
    # TUITION2 = In-state (for fallback)
    # TUITION3 = Out-of-state (Primary for Sticker Price)
    # CHG4AY3 = Room & Board (On Campus)
    # CHG1AY3 = Books & Supplies
    
    cols = ['UNITID', 'TUITION2', 'TUITION3', 'CHG4AY3', 'CHG1AY3']
    
    try:
        df = pd.read_csv(IC_PATH, usecols=lambda c: c.upper() in cols)
        # Normalize column names to upper case
        df.columns = df.columns.str.upper()
        
        print(f"Loaded {len(df)} rows from ic2024.csv")
        
        # 2. Calculate Sticker Price
        # Logic: Tuition (Out-of-state > In-state) + Room/Board + Books
        
        # Handle non-numeric ("." implies missing in IPEDS sometimes, though read_csv handles standard NaNs)
        # Force numeric errors to NaN
        for col in ['TUITION3', 'TUITION2', 'CHG4AY3', 'CHG1AY3']:
            df[col] = pd.to_numeric(df[col], errors='coerce')
            
        def calc_price(row):
            tuition = row['TUITION3'] if pd.notnull(row['TUITION3']) else row['TUITION2']
            if pd.isnull(tuition): return None
            
            room = row['CHG4AY3'] if pd.notnull(row['CHG4AY3']) else 14000 # Fallback
            books = row['CHG1AY3'] if pd.notnull(row['CHG1AY3']) else 1200 # Fallback
            
            return tuition + room + books

        df['sticker_price'] = df.apply(calc_price, axis=1)
        
        # Filter valid prices
        updates = df[df['sticker_price'].notnull()][['sticker_price', 'UNITID']]
        print(f"Found {len(updates)} valid sticker prices.")
        
        if updates.empty:
            print("No updates found.")
            return

        # 3. Update Database
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        data = list(updates.itertuples(index=False, name=None))
        
        c.executemany("UPDATE schools SET sticker_price = ? WHERE unitid = ?", data)
        conn.commit()
        
        print(f"Successfully updated {c.rowcount} schools in database.")
        conn.close()
        
    except Exception as e:
        print(f"Ingestion Error: {e}")

if __name__ == "__main__":
    ingest_local_costs()
