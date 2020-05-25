
const { Gateway, Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');



async function main() {
    try {
        
        // Get airline id
        let org_id = process.argv[2];
        console.log('Loading up for org id: ' + org_id);

        // get op: getQuery, createQuery, approveQuery, setQueryStage (case sensitive)
        let op = process.argv[3];


        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', '..', 'fabric', 'api-2.0', 'config', 'connection-org' + org_id + '.json');
        let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet'+org_id);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        
        // Check to see if we've already enrolled the user.
        const identity = await wallet.get('appUser');
        if (!identity) {
            console.log('An identity for the user "appUser" does not exist in the wallet');
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, { wallet, identity: 'appUser', discovery: { enabled: true, asLocalhost: true } });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork('mychannel');

        // Get the contract from the network.
        const contract = network.getContract('query_contract');

        // Submit the specified transaction.
        if(op === 'createQuery'){
            const result = await contract.submitTransaction('createQuery', process.argv[4], process.argv[5], process.argv[6], process.argv[7]);
            console.log("New query id: ");
            console.log(`${result.toString()}`);
        }

        if(op === 'setQueryStage'){
            const result = await contract.submitTransaction('setQueryStage', process.argv[4], process.argv[5]);
            console.log("All flight data: ");
            console.log(`${result.toString()}`);
        }

        if(op === 'getQuery'){
            const result = await contract.evaluateTransaction('getQuery', process.argv[4]);
            console.log("Specified flight data: ");
            console.log(`${result.toString()}`);
        }

        if(op === 'approveQuery'){
            const result = await contract.submitTransaction('approveQuery', process.argv[4], process.argv[5]);
            console.log("Booking complete");
            console.log(`${result.toString()}`);
        }

        // Disconnect from the gateway.
        await gateway.disconnect();

    } catch (error) {
        console.error(`Failed to submit transaction: ${error}`);
        process.exit(1);
    }
}

main();