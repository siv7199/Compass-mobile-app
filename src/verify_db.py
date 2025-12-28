import sqlite3
import pandas as pd
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_NAME = r'..\database\compass.db'

def verify_db():
    conn = sqlite3.connect(DB_NAME)
    
    # 1. Check Row Counts
    tables = ['schools', 'admissions', 'programs', 'careers', 'career_skills', 'major_to_career']
    logging.info("--- Row Counts ---")
    for table in tables:
        try:
            count = pd.read_sql_query(f"SELECT COUNT(*) FROM {table}", conn).iloc[0,0]
            logging.info(f"{table}: {count}")
            if count == 0:
                logging.warning(f"Table {table} is empty!")
        except Exception as e:
            logging.error(f"Error checking {table}: {e}")

    # 2. Check Financial Data
    logging.info("\n--- Financial Data Check ---")
    try:
        df_fin = pd.read_sql_query("SELECT COUNT(*) FROM schools WHERE EARNINGS_MEDIAN IS NOT NULL", conn)
        count_fin = df_fin.iloc[0,0]
        logging.info(f"Schools with EARNINGS_MEDIAN: {count_fin}")
        
        if count_fin > 0:
            sample = pd.read_sql_query("SELECT INSTNM, EARNINGS_MEDIAN, DEBT_MEDIAN FROM schools WHERE EARNINGS_MEDIAN IS NOT NULL LIMIT 5", conn)
            logging.info(f"Sample Financial Data:\n{sample}")
        else:
            logging.warning("No financial data found (run scorecard_fetcher.py FIRST)")
            
    except Exception as e:
        logging.error(f"Error checking financial data: {e}")

    # 3. Check Bridge
    logging.info("\n--- Bridge Check ---")
    try:
        df_bridge = pd.read_sql_query("SELECT * FROM major_to_career LIMIT 5", conn)
        logging.info(f"Sample Major-Career Mappings:\n{df_bridge}")
    except Exception as e:
        logging.error(f"Error checking bridge: {e}")

    # 4. Check Join
    logging.info("\n--- Join Check (Sample Path) ---")
    try:
        # Pick a school, find a program, derive SOC, find Career Title
        # Note: We rely on the heuristic bridge
        query = """
        SELECT s.INSTNM, p.CIPCODE, m.SOC_PREFIX, c.TITLE
        FROM schools s
        JOIN programs p ON s.UNITID = p.UNITID
        JOIN major_to_career m ON substr(p.CIPCODE, 1, 2) = m.CIP_PREFIX
        JOIN careers c ON substr(c.SOC_CODE, 1, 2) = m.SOC_PREFIX
        LIMIT 5
        """
        df_join = pd.read_sql_query(query, conn)
        logging.info(f"Join Result:\n{df_join}")
    except Exception as e:
        logging.error(f"Error checking join: {e}")

    conn.close()

if __name__ == "__main__":
    verify_db()
