import csv
import json

# Read CSV data
with open("data/pipeline/output.csv", mode="r", encoding="utf-8") as f:
    data = [{k: v for k, v in row.items()} for row in csv.DictReader(f, skipinitialspace=True)]

# Define the years for processing
years = [2019, 2024]

# Dictionary to store the output for both years
output = {}

for y in years:  # Process for each year
    output[y] = {};  # Initialize output for the year
    json_frontname = f"data/pipeline/original data/fronts{y}.json"
    
    with open(json_frontname, "r", encoding="utf-8") as f:
        front = json.load(f)		
        
    for i in data:
        try:
            year = int(i.get("Year", 0))  # Get Year safely
            rank = int(float(i.get("Rank", 0)))  # Convert Rank properly
            state_code = i.get("State-code")  # Get State-code
            constituency_code = i.get("Constituency-code")  # Get Constituency-code

            if year == y and rank == 1 and state_code and constituency_code:
                # Initialize state code if not exists
                output[y].setdefault(state_code, {})

                # Store constituency details
                output[y][state_code][constituency_code] = {
                    "State": i.get("State", "Unknown"),
                    "Constituency": i.get("Constituency", "Unknown"),
                    "Party": i.get("Party", "Unknown"),
                    "Front": front.get(i.get("Party"), "Others"),  # Assign front based on Party
                }
        except ValueError:
            continue  # Skip rows with invalid Year or Rank

    # Write JSON output for each year
    json_filename = f"data/pipeline/india/indiaayush{y}.json"
    with open(json_filename, "w", encoding="utf-8") as outfile:
        json.dump(output[y], outfile, indent=2)

    print(f"Saved JSON for year {y}: {json_filename}")