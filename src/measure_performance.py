import time
import compass_logic
import logging

# Setup basic logging
logging.basicConfig(level=logging.INFO)

def test_performance():
    print("--- STARTING PERFORMANCE TEST ---")
    start_time = time.time()
    
    # Simulate a standard user request
    user_gpa = 3.5
    user_sat = 1200
    target_career = "15-1252" # Software Developer
    budget = 25000
    
    print(f"Parameters: GPA={user_gpa}, SAT={user_sat}, Career={target_career}, Budget={budget}")
    
    try:
        results = compass_logic.find_loadout(
            user_gpa=user_gpa,
            target_career_soc=target_career,
            user_budget=budget,
            user_sat=user_sat
        )
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"--- RESULTS ---")
        print(f"Total Time: {duration:.4f} seconds")
        print(f"Schools Found: {len(results)}")
        if results:
            print(f"Top School: {results[0]['school_name']} (Score: {results[0]['compass_score']})")
            
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")

if __name__ == "__main__":
    test_performance()
