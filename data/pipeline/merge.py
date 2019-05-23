import csv

with open('original data/2014.csv') as f:
	y2014 = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

with open('original data/2019.csv') as f:
	y2019 = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

with open('original data/constituency.csv') as f:
	constituency = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

with open('original data/1999 to 2009.csv') as f:
	yOld = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

for i in yOld:
	for c in constituency:
		if i["State"].upper() == c["State"].upper():
			if i["Constituency"].upper() == c["Constituency"].upper():
				i["State-code"] = c["State-code"].upper()
				i["Constituency-code"] = c["Constituency-code"].upper()

for i in yOld:
	if "State-code" not in i.keys():
		i["State-code"] = ""
		i["Constituency-code"] = ""

data = []

for i in yOld:
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

for i in y2014:
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

for i in y2019:
	data.append({
		"Year": i["Year"],
		"State": i["State"].upper(),
		"Constituency": i["Constituency"].upper(),
		"Name": i["Name"].upper(),
		"Party": i["Party"].upper(),
		"Votes": i["Votes"].upper(),
		"State-code": i["State-code"],
		"Constituency-code": i["Constituency-code"] ,
		"Rank": i["Rank"]
		})

keys = data[0].keys()
with open('output.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(data)
