import pandas as pd

# Load Dictionary
file_path = r'..\data\ipeds\CollegeScorecardDataDictionary.xlsx'
print(f"Reading {file_path}...")

# Read 'Institution_Data_Dictionary' sheet usually, or just the first one
xls = pd.ExcelFile(file_path)
print("Sheet Names:", xls.sheet_names)

df = pd.read_excel(xls, "Institution_Data_Dictionary")
print("Columns:", list(df.columns))

# Try to find relevant columns dynamically
api_col = [c for c in df.columns if 'dev' in c.lower() or 'api' in c.lower() or 'friendly' in c.lower()]
var_col = [c for c in df.columns if 'variable' in c.lower()]

print(f"Using Columns: {api_col}, {var_col}")

# Looks like columns are standard now. 
# Just print the first few rows to see where 'cost' lives.
print(df.head(1).to_string())

# Filter for Cost/Tuition variables
print("\n--- COST VARIABLES ---")
costs = df[df['developer-friendly name'].astype(str).str.contains('cost', case=False, na=False)]
print(costs[['developer-friendly name', 'VARIABLE NAME']].head(20).to_string())

print("\n--- TUITION VARIABLES ---")
tuition = df[df['developer-friendly name'].astype(str).str.contains('tuition', case=False, na=False)]
print(tuition[['developer-friendly name', 'VARIABLE NAME']].head(20).to_string())
