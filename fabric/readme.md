# BasicNetwork-2.0
Fork of https://github.com/adhavpavan/BasicNetwork-2.0
Initial hyperledger fabric setup for team NEC

# Quick Usage

To setup network first run. This generetates the cryptomaterial (genesis blocks, certificates), needs to only be run once:
```
bash ./setup_network.sh
```

To start network (create docker containers, join channels run):
```
./start_network.sh
```

To deploy a contract run:
```
./deployChaincode.sh ./artifacts/src/github.com/fabcar/javascript fabcar 1 initLedger []
```

Where the first argument is the path to the chaincode, the second is the chaincode name, third is version. Finally the 4th and 5th are optinal and execute a function (literal name) with the following arguments (JSON array) 

To shutdown the network:
```
./stop_network.sh
```

# Api Set-up

First make sure that `setup_network.sh` was run before. Then manage all certs with the following python scripts.
```
python3 generate_certificates.py 1
python3 generate_certificates.py 2
python3 generate_certificates.py 3
```

Assuming the network is running, execute the following command.
```
cd fabric/api-2.0
npm run start
```

# Known issues
```
"tool x" is not recognised as a bash command
```
Add hyperledger Fabric binaries to the class path

```
Script is not executable
```
Set script as executable in your file system
```
chmod +x filename.sh
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

