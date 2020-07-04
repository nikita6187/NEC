import requests
import time

addr_mo = "http://localhost:11600"
addr_dc = "http://localhost:11700"

# CREATE QUERY -> DC
json_data = {
    "query_text": "can i have sum data?",
    "min_users": 10,
    "max_budget": 100
}
r = requests.post(addr_dc + '/createQuery/', json=json_data)
print("Time elapsed when creating query: " + str(r.elapsed.total_seconds()) + " seconds")
query_id = r.json()['query_id']

# CREATE 500 WALLETS
start = time.time()
for i in range(500):
    r = requests.get(addr_mo + '/acceptQuery/' + str(i) + '/' + str(query_id) + '/', json=json_data)
end = time.time()
print("Time elapsed to create 500 wallets: " + str(end - start))
