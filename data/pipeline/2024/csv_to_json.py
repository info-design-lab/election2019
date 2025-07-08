import csv
import json

# Input and output file names
csv_file = "data/pipeline/2024/2024_new.csv"
json_file = "data/pipeline/india/Nishitindia2024.json"

# Dictionary to store the converted data
results = {}

# Mapping of parties to their respective fronts
front_mapping = {
    "BJP": "NDA",
	"ATDP": "NDA",
	"JD(U)": "NDA",
	"SHS": "NDA",
	"PMK": "NDA",
	"NCP": "NDA",
	"JD(S)": "NDA",
	"AD": "NDA",
	"AGP": "NDA",
    "JSP": "NDA",
	"NPP": "NDA",
	"RLD": "NDA",
	"SKM": "NDA",


	"INC": "UPA",
	"SP": "UPA",
	"CPIM": "UPA",
	"RJD": "UPA",
	"DMK": "UPA",
	"NCP(SP)": "UPA",
	"AAP": "UPA",
	"CPI": "UPA",
	"JMM": "UPA",
	"CPI(ML)(L)": "UPA",
	"RSP": "UPA",
	"AIFB": "UPA",
    "IUML": "UPA",
	"JKNC": "UPA",
	"VCK": "UPA",
	"BAP": "UPA",
	"KEC": "UPA",
	"MDMK": "UPA"
}

# Read the CSV file and process data
with open(csv_file, mode="r", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    for row in reader:
        state_code = row["State-code"]
        constituency_code = row["Constituency-code"]
        state = row["State"]
        constituency = row["Constituency"]
        party = row["Party"]

        # Assign front based on party
        front = front_mapping.get(party, "Others")

        # Initialize state if not exists
        if state_code not in results:
            results[state_code] = {}

        # **Check if the constituency is already added, if not, then add**
        if constituency_code not in results[state_code]:
            results[state_code][constituency_code] = {
                "State": state,
                "Constituency": constituency,
                "Party": party,
                "Front": front,
            }

# Write the transformed data to JSON file
with open(json_file, mode="w", encoding="utf-8") as file:
    json.dump(results, file, indent=2)

print(f"Conversion completed! JSON saved as {json_file}")
