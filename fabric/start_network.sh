#!/bin/bash
# USAGE EXAMPLE: bash start_network.sh ./artifacts/src/github.com/fabcar/javascript fabcar
# Then end: bash end_network.sh
# NOTE: make sure that the Hyperledger Fabric binaries are in the PATH env var

# Step 1: Create crypto material
pushd ./artifacts/channel/
sh create-artifacts.sh
popd

# Step 2: Start docker compose in detached mode
# NOTE: difference in versions
pushd ./artifacts
docker-compose up -d
popd
# Wait 15s to make sure all containers are up and running
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
./deployChaincode.sh $1 $2

