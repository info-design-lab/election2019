import csv
import json

with open('output.csv') as f:
	oldData = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

data = {}
for i in oldData:
	if i["State"] not in data.keys():
		data[i["State"]] = {}

	if i["Constituency"] not in data[i["State"]].keys():
		data[i["State"]][i["Constituency"]] = {}

	if i["Year"] not in data[i["State"]][i["Constituency"]].keys():
		data[i["State"]][i["Constituency"]][i['Year']] = {}

	if i["Rank"] == "1":
		data[i["State"]][i["Constituency"]][i['Year']]["Party"] = i["Party"]
		data[i["State"]][i["Constituency"]][i['Year']]["Margin"] = int(i["Votes"])
		data[i["State"]][i["Constituency"]][i['Year']]["Total Votes"] = int(i["Votes"])
	elif i["Rank"] == "2":
		data[i["State"]][i["Constituency"]][i['Year']]["Margin"] = data[i["State"]][i["Constituency"]][i['Year']]["Margin"] - int(i["Votes"])
		data[i["State"]][i["Constituency"]][i['Year']]["Total Votes"] += int(i["Votes"])
		data[i["State"]][i["Constituency"]][i['Year']]["Runner"] = i["Party"]
	else:
		data[i["State"]][i["Constituency"]][i['Year']]["Total Votes"] += int(i["Votes"])

with open('margin.json', 'w') as outfile:
    json.dump(data, outfile)
