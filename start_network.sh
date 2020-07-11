#!/bin/bash

# Step 1: Start docker compose in detached mode
pushd ./fabric
pushd ./artifacts
docker-compose up -d
popd

# Step 2: Wait 15s to make sure all containers are up and running
sleep 15s
docker ps

# Step 3: Create channel
sh ./createChannel.sh

sleep 10

# Step 4: Check that channels are joined
docker exec -it peer0.org1.example.com sh -c "peer channel list"
docker exec -it peer0.org2.example.com sh -c "peer channel list"
docker exec -it peer0.org3.example.com sh -c "peer channel list" 

# Step 5: deploy chaincode
bash deployChaincode.sh artifacts/src/query_contract/ query_contract 1 initLedger []
bash deployChaincode.sh artifacts/src/coin_contract coin_contract 1 initLedger [\"Org1MSP\"]
bash deployChaincode.sh artifacts/src/aggregated_answer_contract/ agg_answer 1 initLedger []
popd

# Step 8: init api
# API_ARG="$1"
# init_and_test_api() {
# 	if [ -z "${API_ARG}" ]
# 		then 
# 			return 0
# 	fi
	
# 	pushd ./api-2.0
# 	npm run devstart 4000 clean
# 	popd

# 	# Step 8: run 3 demo queries
# 	#python3 quicktest_api.py 4000 nikita20 2 req query_contract getAllQueries " "
# 	#python3 quicktest_api.py 4000 nikita22 2 req agg_answer getAnswer a1
# 	#python3 quicktest_api.py 4000 nikita2 1 post coin_contract createWallet " "
# }

# init_and_test_api
