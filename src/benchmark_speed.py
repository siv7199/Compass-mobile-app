import time
from compass_logic import find_loadout

start = time.time()
print("Starting Search for Engineer...")
results = find_loadout(3.5, "15-1252.00", 25000) # Software Developer SOC
end = time.time()

print(f"Search Complete. Found {len(results)} schools.")
print(f"Time Taken: {end - start:.4f} seconds")
