import pandas as pd

# Load first few rows
try:
    df = pd.read_csv(r'..\data\ipeds\c2024_a.csv', nrows=5)
    print("Columns in c2024_a.csv:")
    print(list(df.columns))
except Exception as e:
    print(f"Error reading c2024_a: {e}")

try:
    df_hd = pd.read_csv(r'..\data\ipeds\hd2024.csv', nrows=5)
    print("\nColumns in hd2024.csv:")
    print(list(df_hd.columns))
except Exception as e:
    print(f"Error reading hd2024: {e}")
