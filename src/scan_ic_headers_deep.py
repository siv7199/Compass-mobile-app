import pandas as pd
try:
    # Read only headers
    df = pd.read_csv(r'..\data\ipeds\ic2024.csv', nrows=0)
    cols = df.columns.tolist()
    
    print(f"Total Columns: {len(cols)}")
    
    # Filter for interesting ones
    keywords = ['TUIT', 'CHG', 'COST', 'PRICE', 'ROOM', 'BOARD', 'BOOK']
    found = [c for c in cols if any(k in c.upper() for k in keywords)]
    
    print("MATCHING COLUMNS:")
    print(found)
    
except Exception as e:
    print(f"Error: {e}")
