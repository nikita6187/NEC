# Agg Answer Smart Contract api

To deploy:
```
bash ./deployChaincode.sh ./artifacts/src/aggregated_answer_contract/ agg_answer 1 initLedger []
```

API testing:
```
python3 quicktest_api.py 4000 nikita20 2 req agg_answer getAnswer a1
```

