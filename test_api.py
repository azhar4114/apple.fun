import urllib.request
import urllib.parse
import json

url = 'https://script.google.com/macros/s/AKfycbyMa7q95YC4y3A6dZgTSG90YUWJMCKebImZqZnk3FxcrtDkltif2KNDQFKbpFVWnSQp/exec'
data = urllib.parse.urlencode({'key': 'x', 'action': 'validate', 'url': 'http://localhost:8000/fruits.html'}).encode('ascii')

req = urllib.request.Request(url, data=data)
try:
    with urllib.request.urlopen(req) as response:
        print(response.read().decode('utf-8')[:500])
except Exception as e:
    print(e)
