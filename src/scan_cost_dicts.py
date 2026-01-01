import pandas as pd
import os

data_dir = r'..\data\ipeds'
files = ['cost1_2024_dict.xlsx', 'cost2_2024_dict.xlsx']

for f in files:
    try:
        path = os.path.join(data_dir, f)
        print(f"\n--- Scanning {f} ---")
        xls = pd.ExcelFile(path)
        # Assuming first sheet has variables
        df = pd.read_excel(xls, sheet_name=0)
        
        # Look for keywords
        keywords = ['TUITION', 'FEE', 'ROOM', 'BOARD', 'OUT-OF-STATE']
        mask = df.astype(str).apply(lambda x: x.str.contains('|'.join(keywords), case=False)).any(axis=1)
        
        if not df[mask].empty:
            print(df[mask].head(10).to_string())
        else:
            print("No keywords found.")
            
    except Exception as e:
        print(f"Error {f}: {e}")
