import csv
import json

partiesDict = {}

with open('Party Abbreviation - Sheet.csv') as f:
	#oldData = [{k: v for k, v in row.items()}
	#	for row in csv.DictReader(f, skipinitialspace=True)]
	for row in csv.DictReader(f, skipinitialspace=True):
		partiesDict[row["PARTY"].upper()] = row["ABBREVIATION"]

with open('output.csv') as f:
	y2019 = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

data = []

for i in y2019:
	if i["Party"].upper() not in partiesDict.keys():
		data.append({
			"Year": i["Year"],
			"State": i["State"].upper(),
			"Constituency": i["Constituency"].upper(),
			"Name": i["Name"].upper(),
			"Party": i["Party"].upper(),
			"Votes": i["Votes"].upper(),
			"State-code": i["State-code"],
			"Constituency-code": i["Constituency-code"],
			"Rank": i["Rank"]
			})
	else:
		data.append({
			"Year": i["Year"],
			"State": i["State"].upper(),
			"Constituency": i["Constituency"].upper(),
			"Name": i["Name"].upper(),
			"Party": partiesDict[i["Party"].upper()],
			"Votes": i["Votes"].upper(),
			"State-code": i["State-code"],
			"Constituency-code": i["Constituency-code"],
			"Rank": i["Rank"]
			})

keys = data[0].keys()
with open('2019.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(data)