import requests

addr_oo = "http://localhost:11500"
addr_mo = "http://localhost:11600"
addr_dc = "http://localhost:11700"
addr_user = "http://localhost:11800"
addr_agg = "http://localhost:11900"

# CREATE QUERY -> DC
json_data = {
    "query_text": "can i have sum data?",
    "min_users": 10,
    "max_budget": 100
}
r = requests.post(addr_dc + '/createQuery/', json=json_data)
print("Time elapsed when creating query: " + str(r.elapsed.total_seconds()) + " seconds")
query_id = r.json()['query_id']

# APPROVE QUERY -> OO
json_data = {
    "query_id": query_id,
    "response": True
}
r = requests.post(addr_oo + '/processQuery/', json=json_data)
print("Time elapsed when approving the query: " + str(r.elapsed.total_seconds()) + " seconds")

# GET QUERY -> MO
r = requests.get(addr_mo + '/getQuery/' + query_id)
print("Time elapsed when getting the query and notifying the clients: " + str(r.elapsed.total_seconds()) + " seconds")
#
# ACCEPT QUERY -> User
r = requests.post(addr_user + '/acceptQuery/')
print("Time elapsed when the user accepts the query: " + str(r.elapsed.total_seconds()) + " seconds")
#
# SEND DATA -> User
r = requests.post(addr_user + '/sendData/')
print("Time elapsed when the user sends the data: " + str(r.elapsed.total_seconds()) + " seconds")

# AGGREGATE DATA -> Aggregator
json_data = {
    "query_id": str(query_id)
}
r = requests.post(addr_agg + '/putAggDataOnBlockchain/', json=json_data)
print("Time elapsed when aggregating the data and putting it on the blockchain: " + str(r.elapsed.total_seconds()) + " seconds")

# GET AGGREGATED DATA FROM HF -> DC + MO
r = requests.get(addr_dc + '/getAnswerFromHF/' + query_id + '/')
print("DC: Time elapsed when getting the aggregated data from HF: " + str(r.elapsed.total_seconds()) + " seconds")
print(r.json())

r = requests.get(addr_mo + '/getQueryAnswer/' + query_id)
print("MO: Time elapsed when getting the aggregated data from HF: " + str(r.elapsed.total_seconds()) + " seconds")
print(r.json())
