# Oversight Org Clients
2 clients:
- OOclient
- AggregatorClient


## Usage OOClient:
2 API functions

GET: http://127.0.0.1:11500/getNewQuery/
- Returns all queries which haven't yet been processed
- Nothing more needed
- Response will be json list, example:
```
{
  "unprocessed_queries": [
    {
      "fail_message": "",
      "max_budget": "40",
      "min_users": "1",
      "num_approve": 0,
      "num_disapprove": 0,
      "num_majority": 1,
      "query_as_text": "query_test_text",
      "query_id": "q2",
      "stage": 1,
      "wallet_id": "wallet3"
    }
  ]
}
```

POST: http://127.0.0.1:11500/processQuery/
- Approves or disapproves a specific query
- Example body:
```
{
    "query_id": "q1",
    "response": "True"
}
```
Response will be, if succesful:
```
{
  "success": true
}
```

## Usage AggregatorClient:

Notes:
- To decrypt the data, run `data = cipher_suite.decrypt(encrypted_data)`, see encrypt_data method

2 API functions

POST: http://127.0.0.1:11900/receiveData/
- This is to post data by the user to the aggregator

Body:
```
{
    "data": "blablalala",
    "userWalletID": "wallet3",
    "query_id": "q1"
}
```
Returns if everything goes well:
```
{
  "success": true
}
```


GET: http://127.0.0.1:11900/putAggDataOnBlockchain/
- This is to aggregate data, encrypt, put on blockchain and send private keys to MO + DC
In params, set for example:
```
query_id: q1
```
Return, should be something (not tested yet):
```
{
    "answerID": "a2"
}
```
