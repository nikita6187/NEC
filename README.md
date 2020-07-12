# NEC
Our blockchain practical for the NEC challenge


## Prerequisites
To run the network please make sure the following have been installed:
- hyperledger fabric binaries https://hyperledger-fabric.readthedocs.io/en/release-2.0/install.html
- Go and the GOPATH variable
- npm and node
- python3 and pip
	- Packages needed: `flask`,`requests`,`flask_cors`,`cryptography`
- pm2 via (`sudo npm install pm2 -g`)


## Automatic Network Setup

Steps to run:
```
bash setup_network.sh
bash start_network.sh
bash stop_network.sh
```

More details:
To setup the network please run `bash setup_network.sh`. The script will:
- generate all crypto-material
- setup all apis and clients
The network can be started via `bash start_network.sh`, which will start the hyperledger network and all apis and clients.
The network can be stopped via `bash stop_network.sh`, which will stop the network and shutdown all containers.


## How to Run Demo
TODO



## Manual Network Setup
Run the commands in `start_network.sh` up until step 7 from the `/fabric` folder. Then go to the `/clients` folder, and start in 9 new terminals. For each terminal, start the respective Python clients or React acts (see `start_network.sh` for their locations). To start the apps you do not need any parameters other than `python3`/`npm start`. Note: first start the Python clients (Managing organization first), then the react apps. See the `/clients` folder for some examples.

To look into various blockchain aspects, look into the `/fabric` folder.


## Project structure
All network code is located in `/fabric/`. See readme there for additional info.
All client code is located in `/clients`. See readme there for additional info.
Various documentation is located in `docs_fabric_api` that was used previously for smart contract testing.


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
