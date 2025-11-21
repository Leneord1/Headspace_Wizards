import urllib.request, json, sys

data = json.dumps({"sourceFile":"test.csv","rows":[{"col":"val"}]}).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:5000/api/import-events', data=data, headers={'Content-Type':'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('HTTP', resp.status)
        print(resp.read().decode())
except Exception as e:
    print('ERROR', e)
    sys.exit(1)

