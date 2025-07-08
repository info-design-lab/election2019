import csv
import json
import os

# Read CSV data
with open('recent 2024/Recent 2024 Project/data/pipeline/output.csv', mode="r", encoding="utf-8") as f:
    oldData = [{k: v for k, v in row.items()} for row in csv.DictReader(f, skipinitialspace=True)]

# Define state names
stateNames = [
    'JAMMU & KASHMIR'
]

# Ensure directory exists
os.makedirs("stateData", exist_ok=True)

for s in stateNames:
    data = [i for i in oldData if i.get("State") == s]

    data1 = {}

    for i in data:
        year = str(i.get("Year", "Unknown"))  # Ensure Year is a string
        constituency = i.get("Constituency", "Unknown")
        party = i.get("Party", "Unknown")
        votes = i.get("Votes", "0")  # Handle missing votes
        rank = str(i.get("Rank", "-1"))  # Convert rank safely
        name = i.get("Name", "Unknown")
        constituency_code = i.get("Constituency-code", "Unknown")

        try:
            votes = int(votes) if votes.isdigit() else 0
        except ValueError:
            votes = 0  # Default to 0 if votes are invalid

        # Ensure Year & Constituency exist
        data1.setdefault(year, {}).setdefault(constituency, {
            "Constituency-code": constituency_code,
            "Name": name,
            "Party": "",
            "Margin": 0,
            "Total Votes": 0,
            "Ranks": []
        })

        # Process Rank 1 (Winner)
        if rank == "1":
            data1[year][constituency]["Party"] = party
            data1[year][constituency]["Margin"] = votes
            data1[year][constituency]["Total Votes"] = votes
            data1[year][constituency]["Ranks"] = [party]

        # Process Rank 2 (Runner-Up)
        elif rank == "2":
            data1[year][constituency]["Runner"] = party
            data1[year][constituency]["Ranks"].append(party)
            data1[year][constituency]["Margin"] -= votes
            data1[year][constituency]["Total Votes"] += votes

        # Process Other Ranks
        else:
            data1[year][constituency]["Total Votes"] += votes
            data1[year][constituency]["Ranks"].append(party)

    # Sanitize file name (replace spaces & special characters)
    safe_filename = f"stateData/{s.replace(' ', '_').replace('&', 'and')}.json"

    # Write JSON file
    with open(safe_filename, 'w', encoding="utf-8") as outfile:
        json.dump(data1, outfile, indent=2)

    print(f"Saved: {safe_filename}")
