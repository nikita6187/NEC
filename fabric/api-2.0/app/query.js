const { Gateway, Wallets, } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')
const yaml = require('js-yaml')

const helper = require('./helper')



const query = async (channelName, chaincodeName, args, fcn, username, org_name) => {

    console.log("HERE 1");

    try {
        logger.debug(util.format('\n============ Query on channel %s for %s============\n', channelName, org_name));
        
        const org_name_lower = org_name.toLowerCase();

        // load the network configuration
        const ccpPath = path.resolve(__dirname, '..', 'config', 'connection-' + org_name_lower + '.yaml');
        const ccpYaml = fs.readFileSync(ccpPath, 'utf8')
        const ccp = yaml.load(ccpYaml);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet-' + org_name_lower);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const identity = await wallet.get(username);
        if (!identity) {
            console.log(`An identity for the user ${username} does not exist in the wallet, so registering user`);
            await helper.getRegisteredUser(username, org_name, true)
            identity = await wallet.get(username);
            console.log('Run the registerUser.js application before retrying');
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true }
        });

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);

        // Get the contract from the network.
        const contract = network.getContract(chaincodeName);

        let result = await contract.evaluateTransaction(fcn, ...args);

        console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

        result = result.toString();
        let response = {
            result: result
        };

        return response
    } catch (error) {
        console.log("HERE 4");
        console.error(`Failed to evaluate transaction: ${error}`);
        return error.message

    }
}

exports.query = query