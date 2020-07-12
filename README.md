# NEC
Our blockchain practical for the NEC challenge

## Prerequisites
To run the network please make sure the following have been installed:
- hyperledger fabric binaries https://hyperledger-fabric.readthedocs.io/en/release-2.0/install.html
- Go and the GOPATH variable
- npm and node
- python3 and pip
- pm2 via (`sudo npm install pm2 -g`)

## Network Setup
To setup the network please run `bash setup_network.sh`. The script will:
- generate all crypto-material
- setup all apis and clients

The network can be started via `bash start_network.sh`, which will start the hyperledger network and all apis and clients.
The network can be stopped via `bash stop_network.sh`, which will stop the network and shutdown all containers.

## Project structure
All network code is located in `/fabric/`. See readme there for additional info.
All client code is located in `/clients`. See readme there for additional info.

## Smart Contracts
- Located in basic network `/fabric/artifacts/src/`
- JS for smart contracts
- Coin smart contract, Query smart contract & Aggregated Answer smart contract

## API to HF network
- Readme examples in `/fabric_api/`
- Node server for API
- Located in `/fabric/api-2.0`
- `HTTP GET` applies a query on the blockchain
- `HTTP POST` applied an invoke on the blockchain
- Example to run and interact with QueryContract in `/docs_fabric_api/query`
