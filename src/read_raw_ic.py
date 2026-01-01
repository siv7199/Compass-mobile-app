import pandas as pd
try:
    with open(r'..\data\ipeds\ic2024.csv', 'r') as f:
        print("--- LINE 1 (Headers) ---")
        print(f.readline().strip())
        print("\n--- LINE 2 (Data) ---")
        print(f.readline().strip())
except Exception as e:
    print(f"Error: {e}")
