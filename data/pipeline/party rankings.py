import csv
import json
from collections import Counter

with open('output.csv') as f:
	data = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]


year = 2019
output = []

for i in data:
	if int(i["Year"]) == year:
		if int(i["Rank"]) == 1:
			output.append(i["Party"])


print(len(Counter(output)))