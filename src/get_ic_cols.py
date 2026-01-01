import pandas as pd
try:
    df = pd.read_csv(r'..\data\ipeds\ic2024.csv', nrows=0)
    print("ALL COLUMNS:")
    print(list(df.columns))
except Exception as e:
    print(e)
