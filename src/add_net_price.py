import sqlite3
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_NAME = r'..\database\compass.db'

def add_net_price_column():
    conn = sqlite3.connect(DB_NAME)
    try:
        c = conn.cursor()
        c.execute("ALTER TABLE schools ADD COLUMN NET_PRICE INTEGER")
        logging.info("Added NET_PRICE column to schools table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e):
            logging.info("NET_PRICE column already exists.")
        else:
            logging.error(f"Error adding NET_PRICE column: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    add_net_price_column()
