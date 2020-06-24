# Fabric API for Query contract

```
cd NEC/fabric/
```

Optionally:
```
bash ./setup_network.sh
```

To init network:
```
bash start_network.sh
bash ./deployChaincode.sh ./artifacts/src/query_contract/ query_contract 1 initLedger []

```

Optionally:
```
python3 generate_certificates.py 1
python3 generate_certificates.py 2
python3 generate_certificates.py 3
```

Then:
```
cd fabric/api-2.0
npm run start 4000 clean
```

Then in new terminal window.
```
python3 quicktest_api.py 4000 nikita3 2 post query_contract createQuery query_test_text 1 40 wallet3
python3 quicktest_api.py 4000 nikita20 2 req query_contract getQuery q1
python3 quicktest_api.py 4000 nikita27j 3 post query_contract approveQuery q1 1
python3 quicktest_api.py 4000 nikita899 1 post query_contract setQueryStage q1 1
python3 quicktest_api.py 4000 nikita20 2 req query_contract getAllQueries " "
```


### Return type of getAllQueries
Example:
```
{'result': {'result': '[{"Key":"q1","Record":{"fail_message":"","max_budget":10,"min_users":2,"num_approve":0,"num_disapprove":0,"num_majority":1,"query_as_text":"ALL","query_id":"q1","stage":1,"wallet_id":"w1"}},{"Key":"q2","Record":{"fail_message":"","max_budget":"40","min_users":"1","num_approve":0,"num_disapprove":0,"num_majority":1,"query_as_text":"query_test_text","query_id":"q2","stage":1,"wallet_id":"wallet3"}}]'}, 'error': None, 'errorData': None}
```
