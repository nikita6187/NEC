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
Then use the testing files. TODO
