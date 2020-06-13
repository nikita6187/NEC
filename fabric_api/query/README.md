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
python3 quicktest_api.py 4000 nikita27j 3 req query_contract approveQuery 1 test_text (doesn't work yet due to org3.department1 bug)
python3 quicktest_api.py 4000 nikita899 1 post query_contract setQueryStage q1 1
```
