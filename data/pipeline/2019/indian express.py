# Extract data for fronts
import json
import csv
	
with open('indian express raw.json') as f:
    data = json.load(f)

output = []

for s in data:
	for c in s['pc_details']:
		d = {}
		d["Year"] = 2019
		d["State"] = s['state_name']
		d["State-code"] = s['state_code']

		d["Constituency"] = c['pc_name']
		d["Constituency-code"] = c['pc_number']

		d['Name'] = c['candidates'][0]['name']
		d['Party'] = c['candidates'][0]['party']
		d['Rank'] = 1
		output.append(d)

keys = output[0].keys()
with open('2019.csv', 'w') as output_file:
    dict_writer = csv.DictWriter(output_file, keys)
    dict_writer.writeheader()
    dict_writer.writerows(output)
