import csv
import json

# Define the input CSV file and output JSON file
input_csv = "recent 2024/Recent 2024 Project/data/pipeline/2024/output.csv"
output_json = "ANDHRA_PRADESH_2024.json"

# Initialize the data dictionary
data = {"2024": {}}

# Read the CSV file and process the data
with open(input_csv, mode="r", encoding="utf-8") as f:
    reader = csv.DictReader(f)
    for row in reader:
        state = row["State"].strip().upper()
        if state == "ANDHRA PRADESH - TELANGANA":
            constituency = row["Constituency"].strip().upper()
            if constituency not in data["2024"]:
                data["2024"][constituency] = {
                    "Constituency-code": row["Constituency-code"].strip(),
                    "Name": row["Name"].strip(),
                    "Party": row["Party"].strip(),
                    "Margin": int(row["Votes"]) if row["Rank"] == "1" else 0,
                    "Total Votes": int(row["Votes"]),
                    "Ranks": [row["Party"].strip()],
                    "Runner": ""
                }
            else:
                data["2024"][constituency]["Total Votes"] += int(row["Votes"])
                data["2024"][constituency]["Ranks"].append(row["Party"].strip())
                
                if row["Rank"] == "2":
                    data["2024"][constituency]["Runner"] = row["Party"].strip()
                    data["2024"][constituency]["Margin"] -= int(row["Votes"])

# Save the JSON file
with open(output_json, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=4)

print(f"JSON file '{output_json}' has been created successfully.")
