import pandas as pd
import os

data_dir = r'..\data\ipeds'
dict_files = [f for f in os.listdir(data_dir) if f.endswith('.xlsx') and not f.startswith('~$')]

print(f"Scanning {len(dict_files)} dictionaries in {data_dir}...\n")

keywords = ['tuition', 'price', 'cost', 'fee']

for f in dict_files:
    path = os.path.join(data_dir, f)
    print(f"--- Scanning {f} ---")
    try:
        # Load all sheets just in case
        xls = pd.ExcelFile(path)
        for sheet in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet)
            
            # Convert all to string to search
            mask = df.apply(lambda x: x.astype(str).str.contains('|'.join(keywords), case=False, na=False)).any(axis=1)
            matches = df[mask]
            
            if not matches.empty:
                print(f"Sheet: {sheet} - Found {len(matches)} matches")
                # Attempt to print variable name and description if possible
                # IPEDS dicts usually have 'varname' and 'varTitle' or similar
                cols = df.columns.tolist()
                print(f"Columns: {cols}")
                print(matches.head(3).to_string())
                print("\n")
            else:
                pass
    except Exception as e:
        print(f"Error reading {f}: {e}")
