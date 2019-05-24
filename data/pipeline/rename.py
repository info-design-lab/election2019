import csv

with open('output.csv') as f:
	data = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

renaming = {
	"State": {
		"ORISSA" : "ODISHA",
		"DADRA & NAGAR HAVELI": "D&N HAVELI",
		
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
