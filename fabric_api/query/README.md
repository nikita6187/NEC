# Fabric API for Query contract

First create folders `wallet1` - `wallet3`.

To init network:
```
bash start_network.sh ./artifacts/src/query_contract/ query_contract
node enrollAdmin.js 1
node enrollAdmin.js 2
node enrollAdmin.js 3
node registerUser.js 1
node registerUser.js 2
node registerUser.js 3
```
Then use the testing files.
```
node queryTest.js 1 createQuery "query text 2" 2 40 some_wallet3
node queryTest.js 1 approveQuery q2 1
node queryTest.js 1 getQuery q2
node queryTest.js 2 setQueryStage q2 3
```
