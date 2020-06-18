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