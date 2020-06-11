const { Gateway, Wallets, TxEventHandler, GatewayOptions, DefaultEventHandlerStrategies, TxEventHandlerFactory } = require('fabric-network');
const fs = require('fs');
const path = require("path")
const log4js = require('log4js');
const logger = log4js.getLogger('BasicNetwork');
const util = require('util')
const yaml = require('js-yaml')


const helper = require('./helper')

const invokeTransaction = async (channelName, chaincodeName, fcn, args, username, org_name) => {
    try {
        logger.debug(util.format('\n============ invoke transaction on channel %s ============\n', channelName));

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

        const connectOptions = {
            wallet, identity: username, discovery: { enabled: true, asLocalhost: true },
            eventHandlerOptions: {
                commitTimeout: 100,
                strategy: DefaultEventHandlerStrategies.MSPID_SCOPE_ANYFORTX
            },
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccp, connectOptions);

        // Get the network (channel) our contract is deployed to.
        const network = await gateway.getNetwork(channelName);
        const contract = network.getContract(chaincodeName);

        let result = await contract.submitTransaction(fcn, ...args);  // TODO: check

        await gateway.disconnect();

        logger.debug(result.toString());
        result = JSON.parse(result.toString());
        let message = result;

        let response = {
            message: message,
            result
        }

        return response;


    } catch (error) {

        console.log(`Getting error: ${error}`)
        return error.message

    }
}

exports.invokeTransaction = invokeTransaction;