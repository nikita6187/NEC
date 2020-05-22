# BasicNetwork-2.0
Fork of https://github.com/adhavpavan/BasicNetwork-2.0
Initial hyperledger fabric setup for team NEC

# Basic setup

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
./deployChaincode.sh
```
