#!/bin/bash

# Step 1: Create crypto material
pushd ./fabric
pushd ./artifacts/channel/
    echo "Creating artifacts"
    sh create-artifacts.sh
popd

# Step 2: Copy crypto material to API
echo "Setting up API"
python3 generate_certificates.py 1
python3 generate_certificates.py 2
python3 generate_certificates.py 3

# Step 3: Copy crypto material to Blockchain explorer
echo "Setting up blockchain explorer"
python3 copy_crypto-config.py

# Step 4: Install dependencies for Hyperledger Api
pushd ./api-2.0
echo "API dependencies"
npm install
popd
popd

# Step 5: Install client dependencies
pushd ./clients
pushd ./data_consumer/dc-webui
echo "DC dependencies"
npm install
popd

pushd ./managing_org/mo-webui
echo "MO dependencies"
npm install
popd

pushd ./oversight_org/oo-webui
echo "OO dependencies"
npm install
popd
popd

# Step 6: Python dependencies
pip3 install flask
pip3 install flask_cors