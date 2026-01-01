import pandas as pd

try:
    df = pd.read_csv(r'..\data\ipeds\ic2024.csv', nrows=1)
    cols = df.columns.tolist()
    
    related = [c for c in cols if 'TUIT' in c or 'CHG' in c or 'ROOM' in c or 'BOARD' in c]
    print(f"Found {len(related)} related columns:")
    print(related)
    
except Exception as e:
    print(e)
