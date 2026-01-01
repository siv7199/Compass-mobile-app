import pandas as pd

try:
    # Load Dictionary
    df = pd.read_excel(r'..\data\ipeds\ic2024_dict.xlsx', sheet_name='varlist') 
    # Sheet name might be 'varlist', 'Description', or similar. I'll print sheets if fail.
    
    # Keyword Search
    keywords = ['Out-of-state', 'Books', 'Room', 'Tuition']
    
    # Filter
    mask = df.astype(str).apply(lambda x: x.str.contains('|'.join(keywords), case=False)).any(axis=1)
    results = df[mask]
    
    print(f"Found {len(results)} matches.")
    # Print varname and title
    # Assuming columns like 'varname', 'varTitle' exist. 
    print(results.head(20).to_string())

except Exception as e:
    print(f"Error: {e}")
    # Fallback: Print sheet names
    try:
        xls = pd.ExcelFile(r'..\data\ipeds\ic2024_dict.xlsx')
        print(f"Sheets available: {xls.sheet_names}")
    except: pass
