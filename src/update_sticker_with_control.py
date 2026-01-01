import sqlite3
import pandas as pd
import os

# Connect to DB
db_path = r'..\database\compass.db'
conn = sqlite3.connect(db_path)
c = conn.cursor()

# Load Control Data from IPEDS Header File
data_path = r'..\data\ipeds\hd2024.csv'
print(f"Loading IPEDS data from {data_path}...")

try:
    df = pd.read_csv(data_path, encoding='latin1')
    
    # CONTROL: 1=Public, 2=Private non-profit, 3=Private for-profit
    # Filter for UNITID and CONTROL
    df_control = df[['UNITID', 'CONTROL']]
    
    # Prepare Updates
    # Hard Mode Defaults:
    COST_PUBLIC_OOS = 42000  # Out of State Tuition + Room/Board
    COST_PRIVATE = 72000     # Tuition + Room/Board
    
    print("Updating Sticker Prices (Hard Mode)...")
    
    # We will iterate and update. 
    # Logic:
    # If Private (2 or 3) -> 72000
    # If Public (1) -> 42000
    
    rows_updated = 0
    
    updates = []
    for index, row in df_control.iterrows():
        unitid = int(row['UNITID'])
        control = int(row['CONTROL'])
        
        new_price = COST_PRIVATE if control > 1 else COST_PUBLIC_OOS
        updates.append((new_price, unitid))
        
        if len(updates) > 1000:
            c.executemany("UPDATE schools SET sticker_price = ? WHERE unitid = ?", updates)
            rows_updated += len(updates)
            updates = []
            
    if updates:
        c.executemany("UPDATE schools SET sticker_price = ? WHERE unitid = ?", updates)
        rows_updated += len(updates)
        
    conn.commit()
    print(f"Successfully updated sticker_price for {rows_updated} schools.")
    
except Exception as e:
    print(f"Error: {e}")

conn.close()
