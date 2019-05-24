# Add state code to the data from constituency.csv

import csv

with open('constituency.csv') as f:
	constituency = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

with open('output.csv') as f:
	data = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

print(constituency[0])
for i in data:
	state = i["State"].upper()
	const = i["Constituency"].upper()

	if state == "TELANGANA":
		state = "Andhra Pradesh".upper()

	for c in constituency:
		if state == c["State"].upper():
			if const == c["Constituency"].upper():
				i["State-code"] = c["State-code"].upper()
				i["Constituency-code"] = c["Constituency-code"].upper()

check = []

for i in data:
	if "State-code" not in i.keys():
		if i["Constituency"].upper() not in check:
			check.append(i["Constituency"].upper())

print(check)
print(len(check))

keys = data[0].keys()
with open('2019.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(data)
