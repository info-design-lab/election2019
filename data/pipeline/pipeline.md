states = ['A&N ISLANDS', 'ANDHRA PRADESH', 'ARUNACHAL PRADESH', 'ASSAM', 'BIHAR', 	'CHANDIGARH', 'D&N HAVELI', 'DAMAN & DIU', 'GOA', 'GUJARAT', 'HARYANA', 'HIMACHAL PRADESH', 'JAMMU & KASHMIR', 'KARNATAKA', 'KERALA', 'LAKSHADWEEP', 'MADHYA PRADESH', 'MAHARASHTRA', 	'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'NCT OF DELHI', 'ORISSA', 'PUDUCHERRY', 	'PUNJAB', 'RAJASTHAN', 'SIKKIM', 'TAMIL NADU', 'TRIPURA', 'UTTAR PRADESH', 'WEST BENGAL', 	'CHHATTISGARH', 'JHARKHAND', 'UTTARAKHAND', 'ODISHA', 'DADRA & NAGAR HAVELI']


Original Files:
	all.csv 		Has ranks of candidates
	2014.csv 		Has state code and constituency code
	2019.csv 		Has state code and constituency code

Steps:
	1. Add State-code and Constituency-code to all.csv >> addStateCode.py
	2. Add rank to 2014.csv >> rank.py
	   Add rank to 2019.csv >> rank.py
	3. Merge all the data >> merge.py
	4. Convert all party names to their abbreviations >> convertAbbreviations.py

	// Change state of Andhra Pradesh to Andhra Pradesh/Telangana

Map
1. python merge.py
2. python rename.py
3. python stateDataJson.py

Margin:
1. python margin.py

India:
// User rename.py output file
