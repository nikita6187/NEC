
# USAGE EXAMPLE: bash start_network.sh ./artifacts/src/github.com/fabcar/javascript fabcar
# Then end: bash end_network.sh

# NOTE: make sure that the Hyperledger Fabric binaries are in the PATH env var


# Create crypto material
cd ./artifacts/channel/
bash create-artifacts.sh
cd ../

# Start docker compose
# NOTE: difference in versions, sometine need: docker compose up -d
docker-compose up -d

# Create channel
sleep 10
cd ../
bash ./createChannel.sh

# Wait and check that all peers have joined, assuming for now 10 seconds
sleep 10

echo "=========================================== CHECKING THAT ALL PEERS HAVE JOINED =========================="
docker ps
echo "=========================================== END CHECKING THAT ALL PEERS HAVE JOINED =========================="
# TODO: some better checks here


# Deploy chaincode
# NOTE: check if rights are correctly set
sleep 10

./deployChaincode.sh $1 $2

