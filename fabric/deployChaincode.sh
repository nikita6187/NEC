export CORE_PEER_TLS_ENABLED=true
export ORDERER_CA=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
export PEER0_ORG1_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/tls/ca.crt
export PEER0_ORG2_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/peers/peer0.org2.example.com/tls/ca.crt
export PEER0_ORG3_CA=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/peers/peer0.org3.example.com/tls/ca.crt
export FABRIC_CFG_PATH=${PWD}/artifacts/channel/config/

export CHANNEL_NAME=mychannel

setGlobalsForOrderer() {
    export CORE_PEER_LOCALMSPID="OrdererMSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/orderers/orderer.example.com/msp/tlscacerts/tlsca.example.com-cert.pem
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/ordererOrganizations/example.com/users/Admin@example.com/msp
}

setGlobalsForPeer0Org1() {
    export CORE_PEER_LOCALMSPID="Org1MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG1_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/users/Admin@org1.example.com/msp
    # export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org1.example.com/peers/peer0.org1.example.com/msp
    export CORE_PEER_ADDRESS=localhost:7051
}

setGlobalsForPeer0Org2() {
    export CORE_PEER_LOCALMSPID="Org2MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG2_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org2.example.com/users/Admin@org2.example.com/msp
    export CORE_PEER_ADDRESS=localhost:8051
}

setGlobalsForPeer0Org3() {
    export CORE_PEER_LOCALMSPID="Org3MSP"
    export CORE_PEER_TLS_ROOTCERT_FILE=$PEER0_ORG3_CA
    export CORE_PEER_MSPCONFIGPATH=${PWD}/artifacts/channel/crypto-config/peerOrganizations/org3.example.com/users/Admin@org3.example.com/msp
    export CORE_PEER_ADDRESS=localhost:9051
}

presetup() {
    
    
    # TODO: update if needed
    #echo Vendoring Go dependencies ...
    #pushd ./artifacts/src/github.com/fabcar/go
    #GO111MODULE=on go mod vendor
    #popd
    echo Finished vendoring dependencies
}
# presetup

CHANNEL_NAME="mychannel"
CC_RUNTIME_LANGUAGE="node"  # as we're using javascript
CC_SRC_PATH="$1"  #./artifacts/src/github.com/fabcar/go
CC_NAME="$2"  # fabcar
CC_VERSION="$3" # 1
CC_FUNCTION=$4 # function
CC_ARGUMENTS=$5 # []

packageChaincode() {
    rm -rf ${CC_NAME}.tar.gz
    setGlobalsForPeer0Org1
    peer lifecycle chaincode package ${CC_NAME}.tar.gz \
        --path ${CC_SRC_PATH} --lang ${CC_RUNTIME_LANGUAGE} \
        --label ${CC_NAME}_${CC_VERSION}

    echo "===================== Chaincode is packaged on peer0.org1 ===================== "
}
# packageChaincode

installChaincode() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org1 ===================== "

    setGlobalsForPeer0Org2
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org2 ===================== "

    setGlobalsForPeer0Org3
    peer lifecycle chaincode install ${CC_NAME}.tar.gz
    echo "===================== Chaincode is installed on peer0.org3 ===================== "
}

# installChaincode

queryInstalled() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode queryinstalled >&log.txt
    cat log.txt
    PACKAGE_ID=$(sed -n "/${CC_NAME}_${CC_VERSION}/{s/^Package ID: //; s/, Label:.*$//; p;}" log.txt)
    echo PackageID is ${PACKAGE_ID}
    echo "===================== Query installed successful on peer0.org1 on channel ===================== "
}

# queryInstalled

approveForMyOrg1() {
    setGlobalsForPeer0Org1

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} \
        --init-required --package-id ${PACKAGE_ID} --sequence ${CC_VERSION}

    echo "===================== chaincode approved from org 1 ===================== "

}

# approveForMyOrg1

# --signature-policy "OR ('Org1MSP.member')"
# --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG2_CA
# --peerAddresses peer0.org1.example.com:7051 --tlsRootCertFiles $PEER0_ORG1_CA --peerAddresses peer0.org2.example.com:9051 --tlsRootCertFiles $PEER0_ORG2_CA
#--channel-config-policy Channel/Application/Admins
# --signature-policy "OR ('Org1MSP.peer','Org2MSP.peer')"

checkCommitReadyness() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode checkcommitreadiness \
        --channelID $CHANNEL_NAME --name ${CC_NAME} --version ${CC_VERSION} \
        --sequence ${CC_VERSION} --output json --init-required
    echo "===================== checking commit readyness from org 1 ===================== "
}

# checkCommitReadyness

approveForMyOrg2() {
    setGlobalsForPeer0Org2

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${CC_VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${CC_VERSION}
    echo "===================== chaincode approved from org 2 ===================== "
}

# approveForMyOrg2

approveForMyOrg3() {
    setGlobalsForPeer0Org3

    peer lifecycle chaincode approveformyorg -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com --tls $CORE_PEER_TLS_ENABLED \
        --cafile $ORDERER_CA --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --version ${CC_VERSION} --init-required --package-id ${PACKAGE_ID} \
        --sequence ${CC_VERSION}
    echo "===================== chaincode approved from org 3 ===================== "
}

checkCommitReadyness() {

    setGlobalsForPeer0Org1
    peer lifecycle chaincode checkcommitreadiness --channelID $CHANNEL_NAME --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA --name ${CC_NAME} --version ${CC_VERSION} --sequence ${CC_VERSION} --output json --init-required
    echo "===================== checking commit readyness from org 1 ===================== "
}

# checkCommitReadyness

commitChaincodeDefination() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode commit -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        --channelID $CHANNEL_NAME --name ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --version ${CC_VERSION} --sequence ${CC_VERSION} --init-required
}

# commitChaincodeDefination

queryCommitted() {
    setGlobalsForPeer0Org1
    peer lifecycle chaincode querycommitted --channelID $CHANNEL_NAME --name ${CC_NAME}

}

# queryCommitted

chaincodeInvokeInit() {
    setGlobalsForPeer0Org1
    peer chaincode invoke -o localhost:7050 \
        --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA \
        -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --isInit -c '{"Args":[]}'

}

# chaincodeInvokeInit

chaincodeInvoke() {

    # Exits function CC_FUNCTION and CC_ARGUMENTS are not set
    if [ -z "${CC_FUNCTION}" ]; then return 0 ; fi
    if [ -z "${CC_ARGUMENTS}" ]; then return 0; fi

    echo "Invoking {\"function\":\"${CC_FUNCTION}\",\"Args\":${CC_ARGUMENTS}}"

    setGlobalsForPeer0Org1
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"${CC_FUNCTION}\",\"Args\":${CC_ARGUMENTS}}"
}

# chaincodeInvoke

chaincodeTestCoin(){
    setGlobalsForPeer0Org1

    # Create individual wallets and fill them up
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createWallet\",\"Args\":[]}"

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createCoins\",\"Args\":[\"WAL1\",\"1000\"]}"

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createWallet\",\"Args\":[]}"

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createCoins\",\"Args\":[\"WAL2\",\"1000\"]}"

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createWallet\",\"Args\":[]}"
    
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createCoins\",\"Args\":[\"WAL3\",\"1000\"]}"

    # Query all wallets
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["retrieveWallets", "", "99"]}'

    # Transfer
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"transfer\",\"Args\":[\"100\", \"WAL1\", \"WAL2\"]}"

    # Query by id
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["retrieveWallet", "WAL1"]}'

    # Query by id
    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["retrieveWallet", "WAL2"]}'

    # Spend
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"spendCoins\",\"Args\":[\"WAL3\",\"500\"]}"

    peer chaincode query -C $CHANNEL_NAME -n ${CC_NAME} -c '{"Args":["retrieveWallet", "WAL3"]}'
}

chaincodeTestQuery() {
    setGlobalsForPeer0Org1

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createQuery\",\"Args\":[\"ALL\",\"2\", \"50\", \"WAL1\"]}"

    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createQuery\",\"Args\":[\"ALLIN\",\"3\", \"100\", \"WAL2\"]}"
    
    peer chaincode invoke -o localhost:7050 --ordererTLSHostnameOverride orderer.example.com \
        --tls $CORE_PEER_TLS_ENABLED --cafile $ORDERER_CA -C $CHANNEL_NAME -n ${CC_NAME} \
        --peerAddresses localhost:7051 --tlsRootCertFiles $PEER0_ORG1_CA \
        --peerAddresses localhost:8051 --tlsRootCertFiles $PEER0_ORG2_CA \
        --peerAddresses localhost:9051 --tlsRootCertFiles $PEER0_ORG3_CA \
        --waitForEvent \
        -c "{\"function\":\"createQuery\",\"Args\":[\"TRAIN_NUDES\",\"5\", \"150\", \"WAL3\"]}"
}


# Run this function if you add any new dependency in chaincode
# presetup

packageChaincode
installChaincode
queryInstalled
approveForMyOrg1
checkCommitReadyness
approveForMyOrg2
checkCommitReadyness
approveForMyOrg3
checkCommitReadyness
commitChaincodeDefination
queryCommitted
sleep 5 # To make sure the CC is deployed before
chaincodeInvokeInit
sleep 5  # To make sure that the init is completed before
chaincodeInvoke

# Integration tests
# chaincodeTestCoin
# chaincodeTestQuery

# USAGE: bash ./deployChaincode.sh <PATH_TO_CC_SRC> <CC_NAME> <CC_VERSION> <INIT_FUNCTION> <INIT_FUNCTION_ARGS>

