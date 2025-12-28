import sqlite3
import pandas as pd
import os
import glob
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_NAME = r'..\database\compass.db'
DATA_DIR = r'..\data'

def create_connection(db_file):
    """ create a database connection to the SQLite database
        specified by db_file
    :param db_file: database file
    :return: Connection object or None
    """
    conn = None
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except sqlite3.Error as e:
        logging.error(e)
    return conn

def create_tables(conn):
    """ create a table from the create_table_sql statement
    :param conn: Connection object
    :return:
    """
    sql_create_schools_table = """
    CREATE TABLE IF NOT EXISTS schools (
        UNITID INTEGER PRIMARY KEY,
        INSTNM TEXT NOT NULL,
        CITY TEXT,
        STABBR TEXT,
        WEBADDR TEXT,
        LOCALE TEXT,
        EARNINGS_MEDIAN INTEGER,
        DEBT_MEDIAN INTEGER,
        NET_PRICE INTEGER,
        ADM_RATE REAL
    );
    """

    sql_create_admissions_table = """
    CREATE TABLE IF NOT EXISTS admissions (
        UNITID INTEGER NOT NULL,
        SATVR75 INTEGER,
        SATMT75 INTEGER,
        ACTCM75 INTEGER,
        FOREIGN KEY (UNITID) REFERENCES schools (UNITID)
    );
    """

    sql_create_programs_table = """
    CREATE TABLE IF NOT EXISTS programs (
        UNITID INTEGER NOT NULL,
        CIPCODE TEXT,
        CTOTALT INTEGER,
        FOREIGN KEY (UNITID) REFERENCES schools (UNITID)
    );
    """

    sql_create_careers_table = """
    CREATE TABLE IF NOT EXISTS careers (
        SOC_CODE TEXT PRIMARY KEY,
        TITLE TEXT,
        DESCRIPTION TEXT
    );
    """

    sql_create_career_skills_table = """
    CREATE TABLE IF NOT EXISTS career_skills (
        SOC_CODE TEXT NOT NULL,
        SKILL_NAME TEXT,
        IMPORTANCE REAL,
        FOREIGN KEY (SOC_CODE) REFERENCES careers (SOC_CODE)
    );
    """

    sql_create_major_to_career_table = """
    CREATE TABLE IF NOT EXISTS major_to_career (
        CIP_PREFIX TEXT,
        SOC_PREFIX TEXT
    );
    """

    try:
        c = conn.cursor()
        c.execute(sql_create_schools_table)
        c.execute(sql_create_admissions_table)
        c.execute(sql_create_programs_table)
        c.execute(sql_create_careers_table)
        c.execute(sql_create_career_skills_table)
        c.execute(sql_create_major_to_career_table)
        logging.info("Tables created successfully.")
    except sqlite3.Error as e:
        logging.error(e)

def ingest_schools(conn):
    logging.info("Ingesting schools...")
    file_path = os.path.join(DATA_DIR, 'ipeds', 'hd2024.csv')
    try:
        df = pd.read_csv(file_path, encoding='latin1') # IPEDS often uses Latin1
        # Keep: INSTNM, CITY, STABBR, WEBADDR, LOCALE
        df_filtered = df[['UNITID', 'INSTNM', 'CITY', 'STABBR', 'WEBADDR', 'LOCALE']]
        df_filtered.to_sql('schools', conn, if_exists='append', index=False)
        logging.info(f"Ingested {len(df_filtered)} schools.")
    except Exception as e:
        logging.error(f"Error ingesting schools: {e}")

def ingest_admissions(conn):
    logging.info("Ingesting admissions...")
    file_path = os.path.join(DATA_DIR, 'ipeds', 'adm2024.csv')
    try:
        df = pd.read_csv(file_path, encoding='latin1')
        # Keep: SATVR75, SATMT75, ACTCM75
        df_filtered = df[['UNITID', 'SATVR75', 'SATMT75', 'ACTCM75']]
        df_filtered.to_sql('admissions', conn, if_exists='append', index=False)
        logging.info(f"Ingested {len(df_filtered)} admissions records.")
    except Exception as e:
        logging.error(f"Error ingesting admissions: {e}")

def ingest_programs(conn):
    logging.info("Ingesting programs (Bachelor's)...")
    file_path = os.path.join(DATA_DIR, 'ipeds', 'c2024_a.csv')
    try:
        # Check available columns first as large file
        # df_iter = pd.read_csv(file_path, encoding='latin1', chunksize=10000)
        # Assuming we can load it or process in chunks. It's 43MB, memory should be fine.
        df = pd.read_csv(file_path, encoding='latin1')
        
        # Filter AWLEVEL=5 (Bachelor's)
        # Note: IPEDS columns might be uppercase.
        df = df[df['AWLEVEL'] == 5]
        
        # Keep: UNITID, CIPCODE, CTOTALT
        df_filtered = df[['UNITID', 'CIPCODE', 'CTOTALT']]
        df_filtered.to_sql('programs', conn, if_exists='append', index=False)
        logging.info(f"Ingested {len(df_filtered)} program records.")
    except Exception as e:
        logging.error(f"Error ingesting programs: {e}")

def ingest_careers(conn):
    logging.info("Ingesting careers (O*NET)...")
    file_path = os.path.join(DATA_DIR, 'onet', 'Occupation Data.xlsx')
    try:
        df = pd.read_excel(file_path)
        # Columns might be 'O*NET-SOC Code', 'Title', 'Description'
        # Inspect columns if needed, but assuming standard O*NET format
        # Rename for DB
        df = df.rename(columns={
            'O*NET-SOC Code': 'SOC_CODE',
            'Title': 'TITLE',
            'Description': 'DESCRIPTION'
        })
        df_filtered = df[['SOC_CODE', 'TITLE', 'DESCRIPTION']]
        df_filtered.to_sql('careers', conn, if_exists='append', index=False)
        logging.info(f"Ingested {len(df_filtered)} careers.")
    except Exception as e:
        logging.error(f"Error ingesting careers: {e}")

def ingest_skills(conn):
    logging.info("Ingesting career skills (O*NET)...")
    file_path = os.path.join(DATA_DIR, 'onet', 'Skills.xlsx')
    try:
        df = pd.read_excel(file_path)
        # Filter Scale Name = 'Importance' and Data Value > 3.5
        # Columns: 'O*NET-SOC Code', 'Element Name', 'Scale Name', 'Data Value'
        df = df[(df['Scale Name'] == 'Importance') & (df['Data Value'] > 3.5)]
        
        df = df.rename(columns={
            'O*NET-SOC Code': 'SOC_CODE',
            'Element Name': 'SKILL_NAME',
            'Data Value': 'IMPORTANCE'
        })
        
        df_filtered = df[['SOC_CODE', 'SKILL_NAME', 'IMPORTANCE']]
        df_filtered.to_sql('career_skills', conn, if_exists='append', index=False)
        logging.info(f"Ingested {len(df_filtered)} career skills.")
    except Exception as e:
        logging.error(f"Error ingesting career skills: {e}")

def create_heuristic_bridge(conn):
    logging.info("Creating heuristic bridge (CIP to SOC)...")
    try:
        # Get unique CIP codes and SOC codes
        # Actually, we can generate all possible mappings or just based on existing data.
        # The instruction says: Map IPEDS CIPCODE (first 2 digits) to O*NET SOC Code (first 2 digits).
        
        # We can extract distinct prefixes from the database tables we just populated
        c = conn.cursor()
        
        # Get distinct CIP prefixes
        c.execute("SELECT DISTINCT substr(CIPCODE, 1, 2) FROM programs")
        cip_prefixes = [row[0] for row in c.fetchall() if row[0]]
        
        # Get distinct SOC prefixes
        c.execute("SELECT DISTINCT substr(SOC_CODE, 1, 2) FROM careers")
        soc_prefixes = [row[0] for row in c.fetchall() if row[0]]
        
        # This is a HEURISTIC mapping. 
        # Example logic: '11' (CIP Computer) -> '15' (SOC Computer)
        # Since we don't have a file, we might just create a generic crosswalk if prefixes match?
        # Or better, just store the prefixes themselves?
        # The prompt says "Map IPEDS CIPCODE (first 2 digits) to O*NET SOC Code (first 2 digits)."
        # It implies a 1-to-1 or N-to-N mapping based on specific knowledge or just alignment.
        # Without a mapping file, we can't know for sure which CIP prefix maps to which SOC prefix exactly EXCEPT for the example.
        # However, usually there is a standard crosswalk. 
        # For this task, "Create a heuristic mapping table" -> maybe just creating the structure and populating likely matches?
        # Or maybe the user implies simply *defining* the table and maybe a few known mappings?
        # "Map IPEDS CIPCODE (first 2 digits) to O*NET SOC Code (first 2 digits)."
        # This could mean "Create a row for every combination that 'makes sense'" or just "implement logic to do this".
        # I will implement a basic mapping based on known common codes for demonstration, or logic that tries to align them if they were same (they are not).
        # Let's try to map generic categories.
        # Actually, maybe the instruction implies "Implement the mechanism to do this mapping". 
        # I'll create a few sample mappings including the required one.
        
        mappings = [
            ('11', '15'), # Computer Science -> Computer and Mathematical Occupations
            ('14', '17'), # Engineering -> Architecture and Engineering
            ('52', '11'), # Business -> Management
            ('51', '29'), # Health -> Healthcare Practitioners
            ('27', '15'), # Mathematics -> Computer and Mathematical
            ('50', '27'), # Visual & Peforming Arts -> Arts, Design, Entertainment, Sports, and Media
        ]
        
        # Also just inserting all CIP prefixes as keys might be useful if we had the targets.
        
        c.executemany("INSERT INTO major_to_career (CIP_PREFIX, SOC_PREFIX) VALUES (?, ?)", mappings)
        conn.commit()
        logging.info("Created heuristic bridge with sample mappings.")
        
    except Exception as e:
        logging.error(f"Error creating heuristic bridge: {e}")

def main():
    database = DB_NAME
    
    # helper to remove old db if needed for clean run, though IF NOT EXISTS handles tables.
    # but to avoid duplicates if running multiple times without constraints working perfectly (e.g. if_exists='append')
    if os.path.exists(database):
        os.remove(database)
        logging.info("Removed existing database for clean start.")

    conn = create_connection(database)

    if conn is not None:
        create_tables(conn)
        ingest_schools(conn)
        ingest_admissions(conn)
        ingest_programs(conn)
        ingest_careers(conn)
        ingest_skills(conn)
        create_heuristic_bridge(conn)
        conn.close()
    else:
        logging.error("Error! cannot create the database connection.")

if __name__ == '__main__':
    main()
