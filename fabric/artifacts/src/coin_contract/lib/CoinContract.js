const { Contract } = require('fabric-contract-api');

export default class QueryContract extends Contract {
    // initiliazes contract ledger
    async initLedger(ctx) {
    
    }

    /**
     * @param {Stub} ctx
     * @param {Float} amount the coins to transfer from wallet id fromAddress to wallet id toAddress
     * @param {String} toAddress the address of the wallet that should receive the coins
     * @param {String} fromAddress (optional) the address of the wallet that should send the coins.
     *                 If undefined, will be set to the caller's wallet
     */
    async transfer(ctx, amount, toAddress, fromAddress = undefined) {
        const schema = Joi.object().keys({
            amount: Joi.number().required().positive(),
            toAddress: Joi.string().required().walletId(),
            fromAddress: Joi.string().optional().walletId()
        });

        try {
            await schema.validate({
                amount, toAddress, fromAddress
            });
        } catch (error) {
            throw new ChaincodeError(ERRORS.VALIDATION, {
                'message': error.message,
                'details': error.details
            });
        }

        let fromWallet;
        if (fromAddress) {
            fromWallet = await AbstractWallet.queryWalletByAddress(txHelper, fromAddress);

            if (!fromWallet) {

                throw new ChaincodeError(ERRORS.UNKNWON_WALLET, {
                    'address': fromAddress
                });
            }
        } else {
            fromWallet = await this.retrieveOrCreateMyWallet(stub, txHelper);
        }

        const toWallet = await AbstractWallet.queryWalletByAddress(txHelper, toAddress);

        if (!toWallet) {

            throw new ChaincodeError(ERRORS.UNKNOWN_ENTITY, {
                'address': toAddress
            });
        }

        if (!fromWallet.txCreatorHasPermissions(txHelper)) {

            throw new ChaincodeError(ERRORS.NOT_PERMITTED, {
                'address': fromWallet.address
            });
        }

        if (!fromWallet.canSpendAmount(amount)) {

            throw new ChaincodeError(ERRORS.INSUFFICIENT_FUNDS, {
                'address': fromWallet.address
            });
        }

        fromWallet.addAmount(-amount);
        toWallet.addAmount(amount);

        this.logger.info(`Transfering ${amount} from ${fromWallet.address} to ${toAddress.address}`);

        return Promise.all([
            fromWallet.save(txHelper),
            toWallet.save(txHelper)
        ]).then(([from, to]) => {

            return {
                'from': from,
                'to': to
            };
        });
    }

}