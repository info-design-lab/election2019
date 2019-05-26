import urllib.request as urllib2
from bs4 import BeautifulSoup
import csv

with open('constituency.csv') as f:
	constituency = [{k: v for k, v in row.items()}
		for row in csv.DictReader(f, skipinitialspace=True)]

data = []

for c in constituency:
	print(c['State'], c['Constituency'])
	ST_CODE = c['State-code']
	C_CODE = c['Constituency-code']
	quote_page = 'http://results.eci.gov.in/pc/en/constituencywise/Constituencywise' + ST_CODE + str(C_CODE) + '.htm'

	# query the website and return the html to the variable ‘page’
	page = urllib2.urlopen(quote_page)

	# parse the html using beautiful soup and store in variable `soup`
	soup = BeautifulSoup(page, 'html.parser')

	c_data = []
	# Take out the <div> of name and get its value
	for tr in soup.find_all('tr')[2:]:
		tds = tr.find_all('td')
		
		if (c['State'] != "Jammu & Kashmir" and len(tds) == 7) or (c['State'] == "Jammu & Kashmir" and len(tds) == 8):
			if tds[1].text == "Total":
				continue
			else:
				d = {}
				d['Year'] = 2019
				d['Name'] = tds[1].text
				d['Party'] = tds[2].text

				if c['State'] == "Jammu & Kashmir":
					d['Votes'] = int(tds[6].text)
				else:
					d['Votes'] = int(tds[5].text)

				d['State'] = c['State']
				d['State-code'] = c['State-code']
				d['Constituency'] = c['Constituency']
				d['Constituency-code'] = c['Constituency-code']

				if tds[1].text == "NOTA":
					d['Rank'] = -1
					nota = d
				else:
					d['Rank'] = int(tds[0].text)
					c_data.append(d)

	c_data.sort(key=lambda x: x['Votes'], reverse=True)
	c_data.append(nota)
	for i in range(len(c_data)):
		cons = c_data[i]
		if cons["Rank"] != -1:
			cons["Rank"] = i + 1
		data.append(cons)

keys = data[0].keys()
with open('output.csv', 'w') as output_file:
	dict_writer = csv.DictWriter(output_file, keys)
	dict_writer.writeheader()
	dict_writer.writerows(data)
