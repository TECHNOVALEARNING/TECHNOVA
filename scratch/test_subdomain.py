import urllib.request
from urllib.error import HTTPError

url = 'https://lws.technovalearning.com/upload.php'
headers = {
    'X-Upload-Secret': 'technova_lws_upload_secure_token_58934751'
}

print(f"Testing GET request to {url}...")
req = urllib.request.Request(url, headers=headers, method='GET')
try:
    response = urllib.request.urlopen(req)
    print("GET Success! Status:", response.status)
    print("Body:", response.read().decode())
except HTTPError as e:
    print("GET HTTP Error status:", e.code)
    print("GET HTTP Error body:", e.read().decode())
except Exception as e:
    print("GET Connection error:", e)
