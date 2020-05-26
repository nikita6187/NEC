#!/bin/bash

# Step 1: docker-compose down network
pushd ./artifacts
docker-compose down
popd

# Remove some old files
# TODO: update this
#rm -rf channel-artifacts/* log.txt
# rm channel-artifacts/mychannel.block log.txt

# TODO: add more parameters from networkDown

