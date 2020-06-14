const logger = utils.logger.getLogger('models/AbstractWallet');

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

const WALLET_TYPE_CLASSNAME_MAPPING = {
    [WALLET_TYPES.USER]: 'UserWallet',
    [WALLET_TYPES.CONTRACT]: 'ContractWallet'
};

class AbstractWallet {

    static async queryWalletByAddress(ctx, address) {
        const dbData = await txHelper.getState(address);

        return mapDBDataToObject(dbData);
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

    get properties() {

        return {};
    }

    set properties(value) {
        // ABSTRACT doesn't have properties, do nothing
    }

    constructor({address, amount = 0.0, type = CONSTANTS.WALLET_TYPES.ABSTRACT}) {
        this.address = address;
        this.amount = amount;
        this.type = type;
    }

    addAmount(amount) {
        this.amount += amount;

        return this;
    }

    canSpendAmount(amount) {

        return this.amount - amount >= 0;
    }

    txCreatorHasPermissions() {

        return false;
    }

    async save(txHelper) {
        await txHelper.putState(this.address, {
            'address': this.address,
            'amount': this.amount,
            'type': this.type,
            'properties': this.properties
        });

        return this;
    }

}

module.exports = AbstractWallet;

function mapDBDataToObject(dbData) {
    const className = CONSTANTS.WALLET_TYPE_CLASSNAME_MAPPING[dbData.type];
    const Class = require(`./${className}`);

    const instance = new Class({
        address: dbData.address,
        amount: dbData.amount,
        type: dbData.type
    });

    instance.properties = dbData.properties || {};

    return instance;
}
