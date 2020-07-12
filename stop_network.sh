#!/bin/bash

# Step 1: Stop WebUIs
pm2 delete API
pm2 delete MO
pm2 delete OO
pm2 delete DC
pm2 delete USER

# Step 2: Kill the python clients
# MO
kill $(lsof -t -i:11600) 
# DC
kill $(lsof -t -i:11700)
# OO
kill $(lsof -t -i:11500)
# OO-Agregator
kill $(lsof -t -i:11900)
# Client
kill $(lsof -t -i:11800)


# Step 1: Stop network
pushd ./fabric
pushd ./artifacts
echo "Stopping Hyperledger Network"
docker-compose down -v --remove-orphans
popd

# Step 2: Stop blockchain explorer
pushd ./blockchainExplorer
echo "Stopping Blockchain Explorer"
docker-compose down
rm -rf crypto-config
popd
popd