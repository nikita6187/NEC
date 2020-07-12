#!/bin/bash
# Step 1: Create crypto material
pushd ./fabric/
pushd ./artifacts/channel/
sh create-artifacts.sh
popd

# # Step 2: Copy crypto to blockchain explorer
python3 copy_crypto-config.py
pushd ./blockchainExplorer
if [ ! -f ".env" ]; then
	touch .env
	echo "COMPOSE_PROJECT_NAME=artifacts" >> .env 
fi
popd

# Step 3: Apply certs to api
python3 generate_certificates.py 1
python3 generate_certificates.py 2
python3 generate_certificates.py 3
popd
