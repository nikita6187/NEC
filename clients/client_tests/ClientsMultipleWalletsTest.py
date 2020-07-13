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
min = 99999
max = 0
l = []
for i in range(500):
    start1 = time.time()
    r = requests.get(addr_mo + '/acceptQuery/' + str(i) + '/' + str(query_id) + '/', json=json_data)
    end1 = time.time()
    elapsed = end1 - start1
    l.append(elapsed)
    if elapsed > max:
        max = elapsed
    if elapsed < min:
        min = elapsed
end = time.time()
l.sort()
first_quartile = l[:125]
third_quartile = l[125:]

sum = 0
for i in range(len(first_quartile)):
    sum += first_quartile[i]
average_first = sum / 125

sum = 0
for i in range(len(third_quartile)):
    sum += third_quartile[i]
average_third = sum / 375

print("Time elapsed to create 500 wallets: " + str(end - start))
print("Median time to create one wallets: " + str((end-start)/500))
print("Minimum time taken to create one wallet " + str(min))
print("Maximum time taken to create one wallet " + str(max))
print("First quartile median: " + str(average_first))
print("Third quartile median: " + str(average_third))
print("Interquartile range: " + str(average_third - average_first))
