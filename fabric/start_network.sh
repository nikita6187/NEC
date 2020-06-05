#!/bin/bash
# Step 1: Start docker compose in detached mode
# NOTE: difference in versions
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
# ./deployChaincode.sh $1 $2

