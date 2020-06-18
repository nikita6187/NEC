// const logger = utils.logger.getLogger('models/AbstractWallet');

const walletPrefix = "WAL";

class Wallet {

    constructor(address, creator, amount) {
        this.address = address;
        this.creator = creator;
        this.amount = amount;
    }

    static async queryWalletByAddress(ctx, address) {
        const dbDataAsBytes = await ctx.stub.getState(address);
        const wallet = JSON.parse(dbDataAsBytes.toString());

        return wallet;
    }

    static async queryWallets(txHelper, type, query) {
        const allResults = await txHelper.getQueryResultAsList({
            'selector': {
                '$and': [
                    {
                        'type': type
                    },
                    query
                ]
            }
        });

        logger.debug(`Query Result ${allResults}`);

        return allResults.map((result) => result.record).map(mapDBDataToObject);
    }

    // get properties() {

    //     return {};
    // }

    // set properties(value) {
    //     // ABSTRACT doesn't have properties, do nothing
    // }

    // addAmount(amount) {
    //     this.amount += amount;

    //     return this;
    // }

    // canSpendAmount(amount) {

    //     return this.amount - amount >= 0;
    // }

    // txCreatorHasPermissions() {

    //     return false;
    // }

    async save(ctx) {
        const walletToString = JSON.stringify({
            'address': walletPrefix + this.address,
            'amount': this.amount,
            'creator': this.creator});

        await ctx.stub.putState(walletPrefix + this.address, 
            Buffer.from(walletToString)
        );

        return walletToString;
    }

}

module.exports = Wallet;