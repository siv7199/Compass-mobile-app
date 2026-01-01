import pandas as pd
try:
    # Read Dictionary
    df = pd.read_excel(r'..\data\ipeds\ic2024_dict.xlsx', sheet_name='varlist')
    # Look for PEO1ISTR
    match = df[df['varname'] == 'PEO1ISTR']
    if not match.empty:
        print("Variable Definition for PEO1ISTR:")
        print(match[['varname', 'varTitle']].to_string(index=False))
    else:
        print("PEO1ISTR not found in dictionary.")
except Exception as e:
    print(f"Error: {e}")
