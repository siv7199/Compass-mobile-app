import pandas as pd
try:
    df = pd.read_csv(r'..\data\ipeds\ic2024.csv', nrows=5)
    print("Columns in ic2024.csv:")
    print(list(df.columns))
except Exception as e:
    print(f"Error: {e}")
