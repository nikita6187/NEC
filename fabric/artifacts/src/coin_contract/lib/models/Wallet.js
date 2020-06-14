// const logger = utils.logger.getLogger('models/AbstractWallet');

const CHAINCODES = {
    'KUMA_TOKEN': 'kuma-token',
    'MULTISIG': 'multisig'
};

const PREFIXES = {
    'WALLET': 'WAL',
    'MULTISIG': 'MULTI',
    'MULTISIG_REQUEST': 'MULTIREQ'
};

const WALLET_TYPES = {
    'ABSTRACT': 'ABSTRACT',
    'USER': 'USER',
    'CONTRACT': 'CONTRACT'
};

class Wallet {

    constructor(address, creator, amount) {
        this.address = address;
        this.creator = creator;
        this.amount = amount;
    }

    static async queryWalletByAddress(ctx, address) {
        const dbData = await ctx.stub.getState(address);

        return dbData;

        //return mapDBDataToObject(dbData);
    }

    // static async queryWallets(txHelper, type, query) {
    //     const allResults = await txHelper.getQueryResultAsList({
    //         'selector': {
    //             '$and': [
    //                 {
    //                     'type': type
    //                 },
    //                 query
    //             ]
    //         }
    //     });

    //     logger.debug(`Query Result ${allResults}`);

    //     return allResults.map((result) => result.record).map(mapDBDataToObject);
    // }

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
            'address': this.address,
            'amount': this.amount,
            'creator': this.creator});

        await ctx.stub.putState(this.address, 
            Buffer.from(walletToString)
        );

        return walletToString;
    }

}

module.exports = Wallet;

// function mapDBDataToObject(dbData) {
//     const className = CONSTANTS.WALLET_TYPE_CLASSNAME_MAPPING[dbData.type];
//     const Class = require(`./${className}`);

//     const instance = new Class({
//         address: dbData.address,
//         amount: dbData.amount,
//         type: dbData.type
//     });

//     instance.properties = dbData.properties || {};

//     return instance;
// }
