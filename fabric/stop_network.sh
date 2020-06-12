#!/bin/bash

# Step 1: docker-compose down network
pushd ./artifacts
docker-compose down
popd

# Step 2: TODO Remove other files
# TODO: update this
#rm -rf channel-artifacts/* log.txt
# rm channel-artifacts/mychannel.block log.txt

# TODO: maybe we need to prune old containers which are eating up disk
# docker volume rm $(docker volume ls -qf dangling=true)