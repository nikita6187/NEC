// const logger = utils.logger.getLogger('models/AbstractWallet');

const walletPrefix = "WAL";

class Wallet {

    constructor(id, orgMSP, amount) {
        this.id = id;
        this.orgMSP = orgMSP;
        this.amount = amount;
    }

    static async queryWalletByID(ctx, id) {

        console.info(`Getting wallet with ID: ${id}`);

        const dbDataAsBytes = await ctx.stub.getState(id);

        console.info(dbDataAsBytes.toString());

        const wallet = JSON.parse(dbDataAsBytes.toString());

        return Wallet.toClass(wallet);
    }

    static async queryWallets(ctx, startID, endID) {
        const startKey = walletPrefix + startID;
        const endKey = walletPrefix + endID;
        const allResults = [];
        for await (const {key, value} of ctx.stub.getStateByRange(startKey, endKey)) {
            const strValue = Buffer.from(value).toString('utf8');
            let record;
            try {
                record = JSON.parse(strValue);
            } catch (err) {
                console.log(err);
                record = strValue;
            }
            allResults.push({ Key: key, Record: record });
        }
        console.info(allResults);
        return JSON.stringify(allResults);
    }

    // get properties() {

    //     return {};
    // }

    // set properties(value) {
    //     // ABSTRACT doesn't have properties, do nothing
    // }

    addAmount(amount) {
        this.amount += amount;

        return this;
    }

    canSpendAmount(amount) {
        return this.amount - amount >= 0;
    }

    txOrgHasPermission(txOrg) {
        return txOrg === this.orgMSP;
    }

    async save(ctx) {
        const walletToString = JSON.stringify({
            'id': walletPrefix + this.id,
            'amount': this.amount,
            'orgMSP': this.orgMSP});

        await ctx.stub.putState(walletPrefix + this.id, 
            Buffer.from(walletToString)
        );

        return walletToString;
    }

    static toClass(json) {
        console.info(json);
        if(!json.id) {
            throw Error(`id field is missing from wallet ${json}`);
        }
        if(parseInt(json.amount) == NaN) {
            throw Error(`amount field is missing from wallet ${json}`);
        }
        if(!json.orgMSP) {
            throw Error(`orgMSP field is missing from wallet ${json}`);
        }
        let id = json.id.split(walletPrefix)[1];

        return new Wallet(id, json.orgMSP, json.amount);
    }

}

module.exports = Wallet;