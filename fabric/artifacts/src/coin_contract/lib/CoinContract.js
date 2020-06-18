const { Contract } = require('fabric-contract-api');
const Wallet = require('./models/Wallet');
const UUID = require('./commons/UUID');

const counterKey = "counter"

class CoinContract extends Contract {
    /** Initializes CoinContract
     * 
     * @param {ctx} ctx 
     */
    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        this.uuid = new UUID(counterKey, 0)
        await this.uuid.init(ctx);
        console.info(`Counter initialized with ${0}`)

        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * @param {ctx} context
     */
    async createWallet(ctx) {
        const id = await this.uuid.incrementCounter(ctx);
        return new Wallet(id, ctx.ClientIdentity, 1000)
             .save(ctx);
    }

    /**
     * @param {ctx} context
     * @param {String} address
     */
    async retrieveWallet(ctx, address) {
        const wallet = await Wallet.queryWalletByAddress(ctx, address);

        return wallet;
    }

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