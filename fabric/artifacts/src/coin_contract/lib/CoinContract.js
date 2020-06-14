const { Contract } = require('fabric-contract-api');

class CoinContract extends Contract {
    // initiliazes contract ledger
    async initLedger(ctx) {
        // console.info('============= START : Initialize Ledger ===========');
        console.info(ctx);
        // console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * @param {Stub} stub
     */
    async retrieveOrCreateMyWallet(ctx) {
        // const myWallet = await UserWallet.queryCurrentUserWallet(ctx);

        // if (myWallet) {
        //     return myWallet;
        // }

        return new UserWallet({
            address: ctx.uuid(CONSTANTS.PREFIXES.WALLET),
            publicKeyHash: txHelper.getCreatorPublicKey(),
            amount: 1000 // add an inital amount of 1000 tokens
        }).save(txHelper);
    }

    /**
     * @param {Stub} stub
     * @param {TransactionHelper} txHelper
     * @param {String} address
     */
    // async retrieveWallet(stub, txHelper, address) {
    //     const schema = Joi.object().keys({
    //         address: Joi.string().required().walletId()
    //     });

    //     try {
    //         await schema.validate({
    //             address
    //         });
    //     } catch (error) {
    //         throw new ChaincodeError(ERRORS.VALIDATION, {
    //             'message': error.message,
    //             'details': error.details
    //         });
    //     }

    //     return AbstractWallet.queryWalletByAddress(txHelper, address);
    // }

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

modul