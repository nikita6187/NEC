const { Contract } = require('fabric-contract-api');
const Wallet = require('./models/Wallet');

class CoinContract extends Contract {
    // initiliazes contract ledger
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        console.log(await this.retrieveOrCreateMyWallet(ctx));

        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * @param {ctx} context
     */
    async retrieveOrCreateMyWallet(ctx) {
        // const myWallet = await UserWallet.queryCurrentUserWallet(ctx);

        // if (myWallet) {
        //     return myWallet;
        // }

        return new Wallet(ctx.stub.getTxID(), 
            ctx.stub.getCreator(), 
            1000).save(ctx);
    }

    /**
     * @param {ctx} context
     * @param {String} address
     */
    async retrieveWallet(address) {
        return Wallet.queryWalletByAddress(ctx, address);
    }

    /**
     * @param {Stub} stub
     * @param {String} chaincodeName
     * @param {Array} chaincodeFunctions (optional)
     */
    // async createContractWallet(ctx, chaincodeName, chaincodeFunctions) {
    //     // TODO: Perform argument verification

    //     return new ContractWallet({
    //         chaincodeName,
    //         chaincodeFunctions,
    //         address: ctx.uuid(CONSTANTS.PREFIXES.WALLET),
    //         amount: 0
    //     }).save(ctx);
    // }

    /**
     * @param {Stub} ctx
     * @param {Float} amount the coins to transfer from wallet id fromAddress to wallet id toAddress
     * @param {String} toAddress the address of the wallet that should receive the coins
     * @param {String} fromAddress (optional) the address of the wallet that should send the coins.
     *                 If undefined, will be set to the caller's wallet
     */
    // async transfer(ctx, amount, toAddress, fromAddress = undefined) {
    //     // TODO: validate arguments

    //     let fromWallet;
    //     if (fromAddress) {
    //         fromWallet = await AbstractWallet.queryWalletByAddress(ctx, fromAddress);

    //         if (!fromWallet) {

    //             throw new ChaincodeError(ERRORS.UNKNWON_WALLET, {
    //                 'address': fromAddress
    //             });
    //         }
    //     } else {
    //         fromWallet = await this.retrieveOrCreateMyWallet(ctx, txHelper);
    //     }

    //     const toWallet = await AbstractWallet.queryWalletByAddress(ctx, toAddress);

    //     if (!toWallet) {

    //         throw new ChaincodeError(ERRORS.UNKNOWN_ENTITY, {
    //             'address': toAddress
    //         });
    //     }

    //     if (!fromWallet.txCreatorHasPermissions(ctx)) {

    //         throw new ChaincodeError(ERRORS.NOT_PERMITTED, {
    //             'address': fromWallet.address
    //         });
    //     }

    //     if (!fromWallet.canSpendAmount(amount)) {

    //         throw new ChaincodeError(ERRORS.INSUFFICIENT_FUNDS, {
    //             'address': fromWallet.address
    //         });
    //     }

    //     fromWallet.addAmount(-amount);
    //     toWallet.addAmount(amount);

    //     this.logger.info(`Transfering ${amount} from ${fromWallet.address} to ${toAddress.address}`);

    //     return Promise.all([
    //         fromWallet.save(ctx),
    //         toWallet.save(ctx)
    //     ]).then(([from, to]) => {

    //         return {
    //             'from': from,
    //             'to': to
    //         };
    //     });
    // }
}

module.exports = CoinContract;