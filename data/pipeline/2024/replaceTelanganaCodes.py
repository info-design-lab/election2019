import csv

partiesDict = {}

with open('constituency2014.csv') as f:
	constituency2014 = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

with open('output.csv') as f:
	data = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

for i in data:
	if i['State'] == "ANDHRA PRADESH" or i['State'] == "TELANGANA":
		s = "ANDHRA PRADESH"
		const = i["Constituency"]
		for c in constituency2014:
			if c["Constituency"].upper() == i["Constituency"].upper():
				i["State-code"] = c["State-code"]
				i["Constituency-code"] = c['Constituency-code']

keys = data[0].keys()
with open('2019.csv', 'w') as output_file:
	dict_writer = csv.DictWriter(output_file, keys)
	dict_writer.writeheader()
	dict_writer.writerows(data)
