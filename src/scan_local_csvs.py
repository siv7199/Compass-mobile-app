import pandas as pd
import os

data_dir = r'..\data\ipeds'
csv_files = [f for f in os.listdir(data_dir) if f.endswith('.csv')]

print(f"Scanning {len(csv_files)} files in {data_dir}...")

keywords = ['TUIT', 'COST', 'PRICE', 'FEE', 'CHG']

for csv_file in csv_files:
    try:
        path = os.path.join(data_dir, csv_file)
        # Read only header
        df = pd.read_csv(path, nrows=0)
        cols = [c.upper() for c in df.columns]
        
        found = []
        for col in cols:
            if any(k in col for k in keywords):
                found.append(col)
        
        if found:
            print(f"\n[MATCH] {csv_file}: Found {len(found)} potential columns.")
            print(f"Sample: {found[:10]}")
        else:
            print(f"\n[NO MATCH] {csv_file}")
            
    except Exception as e:
        print(f"Error reading {csv_file}: {e}")
