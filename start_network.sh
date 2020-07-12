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

# Step 5: Deploy chaincode
bash deployChaincode.sh artifacts/src/query_contract/ query_contract 1 initLedger []
bash deployChaincode.sh artifacts/src/coin_contract coin_contract 1 initLedger [\"Org1MSP\"]
bash deployChaincode.sh artifacts/src/aggregated_answer_contract/ agg_answer 1 initLedger []

# Step 6: Deploy blockchain
pushd ./blockchainExplorer
if [ ! -f ".env" ]; then
	touch .env
	echo "COMPOSE_PROJECT_NAME=artifacts" >> .env 
fi
docker-compose up -d
popd

# Step 7: Start API
pushd ./api-2.0
pm2 --name API start npm -- start 4000 clean
popd

popd

# Wait 5 seconds so that the API is running
sleep 5s

# Step 8: Start clients
pushd clients

pushd managing_org
echo "MO-Client start"
nohup python3 mo_client.py &
popd

# Wait 5 seconds so that the MO is running
sleep 5s

pushd data_consumer
echo "DC-Client start"
nohup python3 DCClient.py &
popd

sleep 1s

pushd oversight_org/oo_client
echo "OO-Client start"
nohup python3 OOClient.py &
popd

sleep 1s

pushd oversight_org/aggregator
echo "OO-Aggregator start"
nohup python3 AggregatorClient.py &
popd

sleep 1s

pushd user
echo "User-Client start"
nohup python3 UserClient.py &
popd

#Step 9: Start WebUIs
pushd ./data_consumer/dc-webui
echo "DC-UI start"
pm2 --name DC start npm -- start
popd

pushd ./managing_org/mo-webui
echo "MO-UI start"
pm2 --name MO start npm -- start
popd

pushd ./oversight_org/oo-webui
echo "OO-UI start"
pm2 --name OO start npm -- start
popd

pushd ./user/user-webui
echo "USER-UI start"
pm2 --name USER start npm -- start
popd