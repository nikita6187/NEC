# BasicNetwork-2.0
Fork of https://github.com/adhavpavan/BasicNetwork-2.0
Initial hyperledger fabric setup for team NEC

# Quick Development Usage

To setup the network and deploy chaincode:
```
bash start_network.sh <PATH TO SMART CONTRACT> <NAME OF SMART CONTRACT>
```
Example with fabcar:
```
bash start_network.sh ./artifacts/src/github.com/fabcar/javascript fabcar
```

To shutdown the network (WARNING: this stops and removes all docker containers):
```
bash end_network.sh

```


# Basic Manual Setup

1. Create cryptomaterial
```
./artifacts/channel/create-artifacts.sh
```
2. Start docker compose network
```
cd ./artifacts/
docker compose up -d
```
3. Create channel
```
./createChannel.sh
```
5. Check that all peers have joined the channel
```
docker ps
docker exec -it org0.peer... sh
peer channel list
```
6. Deploy chaincode
```
./deployChaincode.sh ./artifacts/src/github.com/fabcar/javascript fabcar
```
# Deploying Chaincode

Usage:
```
./deployChaincode.sh <PATH TO SMART CONTRACT> <NAME OF SMART CONTRACT>
```

