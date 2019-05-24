import csv
import json

with open('output.csv') as f:
	data = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

year = [2014, 2019]

for y in year:
	output = {}

	with open('original data/fronts' + str(y) + '.json') as f:
 		front = json.load(f)

	for i in data:
		if int(i["Year"]) == y:
			if int(i["Rank"]) == 1:
				if i["State-code"] not in output.keys():
					output[i["State-code"]] = {}

				output[i["State-code"]][i["Constituency-code"]] = {
					"State": i["State"],
					"Constituency": i["Constituency"],
					"Party": i["Party"],
				}

				if i["Party"] in front.keys():
					output[i["State-code"]][i["Constituency-code"]]["Front"] = front[i["Party"]]
				else:
					output[i["State-code"]][i["Constituency-code"]]["Front"] = "Others"

	with open("india/india" + str(y) + '.json', 'w') as outfile:
	    json.dump(output, outfile)