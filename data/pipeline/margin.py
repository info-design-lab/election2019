import csv
import json

# Read CSV file
with open('data/pipeline/output.csv', mode='r', encoding='utf-8') as f:
    oldData = [{k: v for k, v in row.items()} for row in csv.DictReader(f, skipinitialspace=True)]

data = {}

for i in oldData:
    state, constituency, year, rank, party, votes = (
        i["State"], i["Constituency"], str(i["Year"]), i["Rank"], i["Party"], i["Votes"]
    )

    # Convert rank and votes safely
    try:
        rank = int(float(rank))  # Convert rank to integer
    except ValueError:
        continue  # Skip if rank is invalid

    try:
        votes = int(votes)  # Convert votes to integer
    except ValueError:
        votes = 0  # Default to 0 if votes are invalid

    # Ensure keys exist in the dictionary
    data.setdefault(state, {}).setdefault(constituency, {}).setdefault(year, {})

    # Process data based on rank
    if rank == 1:
        data[state][constituency][year]["Party"] = party
        data[state][constituency][year]["Margin"] = votes
        data[state][constituency][year]["Total Votes"] = votes
    elif rank == 2:
        data[state][constituency][year]["Margin"] = data[state][constituency][year].get("Margin", 0) - votes
        data[state][constituency][year]["Total Votes"] = data[state][constituency][year].get("Total Votes", 0) + votes
        data[state][constituency][year]["Runner"] = party
    else:
        data[state][constituency][year]["Total Votes"] = data[state][constituency][year].get("Total Votes", 0) + votes

# Write JSON file
with open("data/pipeline/margin.json", "w", encoding="utf-8") as outfile:
    json.dump(data, outfile, indent=2)

print("Conversion completed! JSON saved as margin1.json")
