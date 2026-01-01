import pandas as pd

dict_path = r'..\data\ipeds\ic2024_dict.xlsx'

try:
    # First finding sheet names
    xls = pd.ExcelFile(dict_path)
    print(f"Sheets: {xls.sheet_names}")
    
    # Usually the variable list is in 'varlist' or 'Description'
    # I'll try to read the first sheet which is usually the content
    df = pd.read_excel(xls, sheet_name=0) 
    
    # Look for relevant terms
    search_terms = ['Tuition', 'Fee', 'Book', 'Room', 'Board', 'In-district', 'In-state', 'Out-of-state']
    
    print("\n--- Variable Search Matches ---")
    # searching in all text columns
    mask = df.astype(str).apply(lambda x: x.str.contains('|'.join(search_terms), case=False)).any(axis=1)
    
    # Show strict verification: VARNAME and VARNAME/Title
    # Adjust column names based on what we find. usually 'varname' and 'varTitle'
    print(df[mask].head(20).to_string())
    
except Exception as e:
    print(f"Error reading dictionary: {e}")
