import pandas as pd
try:
    # Load all sheets to be safe
    xls = pd.ExcelFile(r'..\data\ipeds\ic2024_dict.xlsx')
    found = False
    
    for sheet in xls.sheet_names:
        df = pd.read_excel(xls, sheet_name=sheet)
        # Search entire dataframe for 'TUITION2'
        mask = df.astype(str).apply(lambda x: x.str.contains('TUITION2', case=False)).any(axis=1)
        if mask.any():
            print(f"Found TUITION2 in sheet: {sheet}")
            print(df[mask].head(1).to_string())
            found = True
            
    if not found:
        print("TUITION2 NOT found in ic2024_dict.xlsx")
        
except Exception as e:
    print(f"Error: {e}")
