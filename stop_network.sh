#!/bin/bash

# Step 1: docker-compose down network
pushd ./fabric
pushd ./artifacts
docker-compose down -v --remove-orphans
popd
pushd ./blockchainExplorer
docker-compose down
rm -rf crypto-config
popd
popd

# Step 2: TODO Remove other files
# TODO: update this
#rm -rf channel-artifacts/* log.txt
# rm channel-artifacts/mychannel.block log.txt

# TODO: maybe we need to prune old containers which are eating up disk
# docker volume rm $(docker volume ls -qf dangling=true)