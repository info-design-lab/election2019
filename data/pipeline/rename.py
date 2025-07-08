import csv

# Read CSV data
with open("data/pipeline/output.csv", mode="r", encoding="utf-8") as f:
    data = [{k: v for k, v in row.items()} for row in csv.DictReader(f, skipinitialspace=True)]

renaming = {
	"State": {
		"ORISSA" : "ODISHA",
		"DADRA & NAGAR HAVELI": "D&N HAVELI",
		"ANDHRA PRADESH": "ANDHRA PRADESH - TELANGANA",
		"TELANGANA": "ANDHRA PRADESH - TELANGANA",
		"ANDAMAN & NICOBAR ISLANDS": "A&N ISLANDS",
		"DELHI": "NCT OF DELHI"
	},
	"Party": {
		"COMMUNIST PARTY OF INDIA  (MARXIST)": "CPM",
		#"ADMK": "AIADMK",
		"ADMK": "DMK",
		"SS": "SHS",
		"AITC": "AITMC",
		"INDEPENDENT": "IND",
		"KERALA CONGRESS  (M)": "KEC(M)"
	}
}

for i in data:
	for r in renaming:
		for j in renaming[r]:
			if i[r] == j:
				i[r] = renaming[r][j]

keys = data[0].keys()
with open('output.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(data)
