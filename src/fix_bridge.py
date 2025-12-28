import sqlite3
import logging

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

DB_NAME = r'..\database\compass.db'

def fix_bridge():
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    
    # Define broader mappings
    # SOC PREFIX -> List of CIP PREFIXES
    new_mappings = {
        '11': ['45', '44', '22', '09', '52'], # Leader: SocSci(Econ), PubAdmin, Legal, Comm, Business
        '15': ['11', '14', '27', '40', '30'], # Engineer: CS, Eng, Math, PhysSci, Interdisciplinary
        '17': ['14', '15', '40'],             # Architect/Eng: Eng, EngTech, PhysSci
        '29': ['51', '26', '42'],             # Healer: Health, Bio, Psych
        '27': ['50', '23', '09', '04', '10'], # Creative: Arts, English, Comm, Arch, CommTech
        '25': ['13', '42', '45', '23', '24'], # Education/Teaching (if applicable)
        '23': ['22', '43', '44']              # Legal (if separate) or mapped to Leader
    }
    
    logging.info("Injecting broader CIP-SOC mappings...")
    
    count = 0
    try:
        # We need to INSERT specific pairs (CIP, SOC)
        # Table schema: CIP_PREFIX, SOC_PREFIX
        
        for soc, cips in new_mappings.items():
            for cip in cips:
                # Check if exists to avoid dupes? No, UNION/DISTINCT in query handles it, or just insert.
                # Let's simple insert.
                c.execute("INSERT INTO major_to_career (CIP_PREFIX, SOC_PREFIX) VALUES (?, ?)", (cip, soc))
                count += 1
                
        conn.commit()
        logging.info(f"Successfully injected {count} new mapping rows.")
        
    except sqlite3.Error as e:
        logging.error(f"Database error: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    fix_bridge()
