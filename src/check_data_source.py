import pandas as pd

# Load Dictionary
df = pd.read_excel(r'..\data\ipeds\CollegeScorecardDataDictionary.xlsx', sheet_name='Institution_Data_Dictionary')

# Filter for relevant variables
vars_of_interest = ['COSTT4_A', 'TUITIONFEE_IN', 'TUITIONFEE_OUT', 'NPT4_PUB', 'NPT4_PRIV']
subset = df[df['VARIABLE NAME'].isin(vars_of_interest)][['VARIABLE NAME', 'developer-friendly name', 'SOURCE']]

print("--- Data Source Verification ---")
print(subset.to_string(index=False))
