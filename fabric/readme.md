# BasicNetwork-2.0
Fork of https://github.com/adhavpavan/BasicNetwork-2.0
Initial hyperledger fabric setup for team NEC

# Quick Usage

To setup network first run. This generetates the cryptomaterial (genesis blocks, certificates), needs to only be run once:
```
./bash setup_network.sh
```

To start network (create docker containers, join channels run):
```
./start_network.sh
```

To deploy a contract run:
```
./deployChaincode.sh ./artifacts/src/github.com/fabcar/javascript fabcar
```

To shutdown the network:
```
./stop_network.sh
```

# Api Set-up

First run ./setup.sh. Then from 
```
artifacts/channel/crypto-config/peerOrganizations/org1.example.com/msp/tlscacerts
``` 
copy the certificate file and place it in 
```
api-2.0/config/connection-org1.yaml

peers:
  peer0.org1.example.com:
    tlsCACerts:
      pem: |
      *** Certificate goes here ***
```
then copy
```
artifacts/channel/crypto-config/peerOrganizations/org1.example.com/tlsca
```
to
```
api-2.0/config/connection-org1.yaml

certificateAuthorities:
  ca.org1.example.com:
    tlsCACerts:
      pem: |
      *** Certificate goes here ***
```

Repeat the same for other peers if you plan to use them. You generally only need to use one peer. 
Start API with
```
npm run start
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

