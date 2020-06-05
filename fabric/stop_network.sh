#!/bin/bash

# Step 1: docker-compose down network
pushd ./artifacts
docker-compose down
popd

# Step 2: TODO Remove other files
# TODO: update this
#rm -rf channel-artifacts/* log.txt
# rm channel-artifacts/mychannel.block log.txt