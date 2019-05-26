import csv
import json

with open('output.csv') as f:
	oldData = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

stateNames = ['A&N ISLANDS', 'ANDHRA PRADESH - TELANGANA', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 	'CHANDIGARH', 'D&N HAVELI', 'DAMAN & DIU', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JAMMU & KASHMIR', 'KARNATAKA', 'KERALA', 'LAKSHADWEEP', 'MADHYA PRADESH', 'MAHARASHTRA', 	'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'NCT OF DELHI', 'PUDUCHERRY', 'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TRIPURA', 'UTTAR PRADESH', 'WEST BENGAL', 'CHHATTISGARH', 'JHARKHAND', 'UTTARAKHAND', 'ODISHA']

for s in stateNames:
	data = []

	for i in oldData:
		if i["State"] == s:
			data.append(i)

	data1 = {}

	for i in data:
		if i["Year"] not in data1.keys():
			data1[i["Year"]] = {}

		if i["Rank"] == "1":
			data1[i["Year"]][i["Constituency"]] = {
				"Constituency-code": i["Constituency-code"],
				"Name": i["Name"],
				"Party": i["Party"],
				"Margin": int(i["Votes"]),
				"Total Votes": int(i["Votes"]),
				"Ranks": [i["Party"]]
			}
		elif i["Rank"] == "2":
			data1[i["Year"]][i["Constituency"]]["Runner"] = i["Party"]
			data1[i["Year"]][i["Constituency"]]["Ranks"].append(i["Party"])
			data1[i["Year"]][i["Constituency"]]["Margin"] -= int(i["Votes"])
			data1[i["Year"]][i["Constituency"]]["Total Votes"] += int(i["Votes"])
		else:
			data1[i["Year"]][i["Constituency"]]["Total Votes"] += int(i["Votes"])
			data1[i["Year"]][i["Constituency"]]["Ranks"].append(i["Party"])

	with open("stateData/" + s + '.json', 'w') as outfile:
	    json.dump(data1, outfile)
