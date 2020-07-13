import requests
import matplotlib as mpl
import time

mpl.use('agg')

import matplotlib.pyplot as plt

addr_oo = "http://localhost:11500"
addr_mo = "http://localhost:11600"
addr_dc = "http://localhost:11700"
addr_user = "http://localhost:11800"
addr_agg = "http://localhost:11900"

l_createquery = []
l_approvequery = []
l_getquery = []
l_acceptquery = []
l_senddata = []
l_aggregatedata = []
l_getaggdata = []

for i in range(0, 40):
    # CREATE QUERY -> DC
    json_data = {
        "query_text": "can i have sum data?",
        "min_users": 10,
        "max_budget": 100
    }

    r = requests.post(addr_dc + '/createQuery/', json=json_data)
    #print("Time elapsed when creating query: " + str(r.elapsed.total_seconds()) + " seconds")
    l_createquery.append(r.elapsed.total_seconds())
    query_id = r.json()['query_id']

    # APPROVE QUERY -> OO
    json_data = {
        "query_id": query_id,
        "response": True
    }
    r = requests.post(addr_oo + '/processQuery/', json=json_data)
    #print("Time elapsed when approving the query: " + str(r.elapsed.total_seconds()) + " seconds")
    l_approvequery.append(r.elapsed.total_seconds())

    # GET QUERY -> MO
    r = requests.get(addr_mo + '/getQuery/' + query_id)
    #print("Time elapsed when getting the query and notifying the clients: " + str(r.elapsed.total_seconds()) + " seconds")
    l_getquery.append(r.elapsed.total_seconds())

    # ACCEPT QUERY -> User
    r = requests.post(addr_user + '/acceptQuery/')
    #print("Time elapsed when the user accepts the query: " + str(r.elapsed.total_seconds()) + " seconds")
    l_acceptquery.append(r.elapsed.total_seconds())

    # SEND DATA -> User
    r = requests.post(addr_user + '/sendData/')
    #print("Time elapsed when the user sends the data: " + str(r.elapsed.total_seconds()) + " seconds")
    l_senddata.append(r.elapsed.total_seconds())

    # AGGREGATE DATA -> Aggregator
    json_data = {
        "query_id": str(query_id)
    }
    r = requests.post(addr_agg + '/putAggDataOnBlockchain/', json=json_data)
    #print("Time elapsed when aggregating the data and putting it on the blockchain: " + str(r.elapsed.total_seconds()) + " seconds")
    l_aggregatedata.append(r.elapsed.total_seconds())

    # GET AGGREGATED DATA FROM HF -> DC + MO
    r = requests.get(addr_dc + '/getAnswerFromHF/' + query_id + '/')
    #print("DC: Time elapsed when getting the aggregated data from HF: " + str(r.elapsed.total_seconds()) + " seconds")
    #print(r.json())
    l_getaggdata.append(r.elapsed.total_seconds())

    # r = requests.get(addr_mo + '/getQueryAnswer/' + query_id)
    # print("MO: Time elapsed when getting the aggregated data from HF: " + str(r.elapsed.total_seconds()) + " seconds")
    # print(r.json())

# sum_createquery_2 = 0
# sum_approvequery_2 = 0
# sum_getquery_2 = 0
# sum_acceptquery_2 = 0
# sum_senddata_2 = 0
# sum_aggregate_2 = 0
# sum_getagg_2 = 0
#
# for i in range(40):
#     sum_createquery_2 += l_createquery[i]
#     sum_approvequery_2 += l_approvequery[i]
#     sum_getquery_2 += l_getquery[i]
#     sum_acceptquery_2 += l_acceptquery[i]
#     sum_senddata_2 += l_senddata[i]
#     sum_aggregate_2 += l_aggregatedata[i]
#     sum_getagg_2 += l_getaggdata[i]
#
# l_createquery.sort()
# l_approvequery.sort()
# l_getquery.sort()
# l_acceptquery.sort()
# l_senddata.sort()
# l_aggregatedata.sort()
# l_getaggdata.sort()
#
#
#
#
# first_quartile_createquery = l_createquery[:10]
# first_quartile_approvequery = l_approvequery[:10]
# first_quartile_getquery = l_getquery[:10]
# first_quartile_acceptquery = l_acceptquery[:10]
# first_quartile_senddata = l_senddata[:10]
# first_quartile_aggregatedata = l_aggregatedata[:10]
# first_quartile_getaggdata = l_getaggdata[:10]
#
# third_quartile_createquery = l_createquery[10:]
# third_quartile_approvequery = l_approvequery[10:]
# third_quartile_getquery = l_getquery[10:]
# third_quartile_acceptquery = l_acceptquery[10:]
# third_quartile_senddata = l_senddata[10:]
# third_quartile_aggregatedata = l_aggregatedata[10:]
# third_quartile_getaggdata = l_getaggdata[10:]
#
# sum_createquery = 0
# sum_approvequery = 0
# sum_getquery = 0
# sum_acceptquery = 0
# sum_senddata = 0
# sum_aggregate = 0
# sum_getagg = 0
#
# for i in range(10):
#     sum_createquery += first_quartile_createquery[i]
#     sum_approvequery += first_quartile_approvequery[i]
#     sum_getquery += first_quartile_getquery[i]
#     sum_acceptquery += first_quartile_acceptquery[i]
#     sum_senddata += first_quartile_senddata[i]
#     sum_aggregate += first_quartile_aggregatedata[i]
#     sum_getagg += first_quartile_getaggdata[i]
#
# sum_createquery_1 = 0
# sum_approvequery_1 = 0
# sum_getquery_1 = 0
# sum_acceptquery_1 = 0
# sum_senddata_1 = 0
# sum_aggregate_1 = 0
# sum_getagg_1 = 0
#
# for i in range(30):
#     sum_createquery_1 += third_quartile_createquery[i]
#     sum_approvequery_1 += third_quartile_approvequery[i]
#     sum_getquery_1 += third_quartile_getquery[i]
#     sum_acceptquery_1 += third_quartile_acceptquery[i]
#     sum_senddata_1 += third_quartile_senddata[i]
#     sum_aggregate_1 += third_quartile_aggregatedata[i]
#     sum_getagg_1 += third_quartile_getaggdata[i]
#
# #create query
# print("\n\n------------CREATE QUERY---------------")
# print("Median time: " + str(sum_createquery_2/40))
# print("Minimum time: " + str(l_createquery[0]))
# print("Maximum time: " + str(l_createquery[-1]))
# print("First quartile median: " + str(sum_acceptquery/10))
# print("Third quartile median: " + str(sum_acceptquery_1/30))
# print("Interquartile range: " + str(sum_acceptquery_1/30 - sum_acceptquery/10))
#
# #create query
# print("\n\n------------APPROVE QUERY---------------")
# print("Median time: " + str(sum_approvequery_2/40))
# print("Minimum time: " + str(l_approvequery[0]))
# print("Maximum time: " + str(l_approvequery[-1]))
# print("First quartile median: " + str(sum_approvequery/10))
# print("Third quartile median: " + str(sum_approvequery_1/30))
# print("Interquartile range: " + str(sum_approvequery_1/30 - sum_approvequery/10))
#
# #create query
# print("\n\n------------GET QUERY---------------")
# print("Median time: " + str(sum_getquery_2/40))
# print("Minimum time: " + str(l_getquery[0]))
# print("Maximum time: " + str(l_getquery[-1]))
# print("First quartile median: " + str(sum_getquery/10))
# print("Third quartile median: " + str(sum_getquery_1/30))
# print("Interquartile range: " + str(sum_getquery_1/30 - sum_getquery/10))
#
# #create query
# print("\n\n------------ACCEPT QUERY---------------")
# print("Median time: " + str(sum_acceptquery_2/40))
# print("Minimum time: " + str(l_acceptquery[0]))
# print("Maximum time: " + str(l_acceptquery[-1]))
# print("First quartile median: " + str(sum_acceptquery/10))
# print("Third quartile median: " + str(sum_acceptquery_1/30))
# print("Interquartile range: " + str(sum_acceptquery_1/30 - sum_acceptquery/10))
#
# #create query
# print("\n\n------------SEND DATA---------------")
# print("Median time: " + str(sum_senddata_2/40))
# print("Minimum time: " + str(l_senddata[0]))
# print("Maximum time: " + str(l_senddata[-1]))
# print("First quartile median: " + str(sum_senddata/10))
# print("Third quartile median: " + str(sum_senddata_1/30))
# print("Interquartile range: " + str(sum_senddata_1/30 - sum_senddata/10))
#
# #create query
# print("\n\n------------AGGREGATE DATA---------------")
# print("Median time: " + str(sum_aggregate_2/40))
# print("Minimum time: " + str(l_aggregatedata[0]))
# print("Maximum time: " + str(l_aggregatedata[-1]))
# print("First quartile median: " + str(sum_aggregate/10))
# print("Third quartile median: " + str(sum_aggregate_1/30))
# print("Interquartile range: " + str(sum_aggregate_1/30 - sum_aggregate/10))
#
# #create query
# print("\n\n------------GET AGGREGATED DATA---------------")
# print("Median time: " + str(sum_getagg_2/40))
# print("Minimum time: " + str(l_getaggdata[0]))
# print("Maximum time: " + str(l_getaggdata[-1]))
# print("First quartile median: " + str(sum_getagg/10))
# print("Third quartile median: " + str(sum_getagg_1/30))
# print("Interquartile range: " + str(sum_getagg_1/30 - sum_getagg/10))

json_data = {
    "query_text": "can i have sum data?",
    "min_users": 10,
    "max_budget": 100
}
r = requests.post(addr_dc + '/createQuery/', json=json_data)
print("Time elapsed when creating query: " + str(r.elapsed.total_seconds()) + " seconds")
query_id = r.json()['query_id']
l = []
for i in range(100):
    start1 = time.time()
    r = requests.get(addr_mo + '/acceptQuery/' + str(i) + '/' + str(query_id) + '/', json=json_data)
    end1 = time.time()
    elapsed = end1 - start1
    l.append(elapsed)

data_to_plot = [l_createquery, l_approvequery, l_getquery, l_acceptquery,
                l_senddata, l_aggregatedata, l_getaggdata, l]

# Create a figure instance
fig = plt.figure(1, figsize=(9, 6))

# Create an axes instance
ax = fig.add_subplot(111)

# Create the boxplot
bp = ax.boxplot(data_to_plot)

# Save the figure
fig.savefig('fig2.png', bbox_inches='tight')