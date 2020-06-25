const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

const Wallet = require('./models/Wallet');
const UUID = require('./commons/UUID');

const counterKey = "counter"

class CoinContract extends Contract {
    /** Initializes CoinContract
     * 
     * @param {ctx} ctx 
     */
    async initLedger(ctx, managingOrg) {
        console.info('============= START : Initialize Ledger ===========');

        this.uuid = new UUID(counterKey, 0)
        await this.uuid.init(ctx);
        console.info(`Counter initialized with ${0}`)

        // Set managingOrg
        if(!managingOrg) {
            throw Error("Missing Managing Organisation MSP!");
        }
        this.managingOrgMSP = managingOrg;
        console.info(`Contract is owned by ${managingOrg}`);

        console.info('============= END : Initialize Ledger ===========');
    }

    /**
     * @param {ctx} context
     */
    async createWallet(ctx) {
        const id = await this.uuid.next(ctx);

        let cid = new ClientIdentity(ctx.stub);

        return new Wallet(id, cid.getMSPID(), 0)
             .save(ctx);
    }

    /**
     * @param {ctx} context
     * @param {String} id id of wallet to retrieve
     */
    async retrieveWallet(ctx, id) {
        const wallet = await Wallet.queryWalletByID(ctx, id);
        return wallet;
    }

    /**
     * @param {ctx} context
     * @param {String} startID (inclusive)
     * @param {String} endID (exclusive)
     */
    async retrieveWallets(ctx, startID, endID) {
        const wallet = await Wallet.queryWallets(ctx, startID, endID);
        return wallet;
    }

    /**
     * @param {Stub} ctx
     * @param {Float} amount amount of coins to transfer, must be a String to avoid Go problems
     * @param {String} toid the id of the wallet that should receive the coins
     * @param {String} fromid the id of the wallet that should send the coins.
     */
    async transfer(ctx, amount, toID, fromID) {
        amount = parseInt(amount);
        if(amount <= 0) {
            throw new Error(`amount(${amount}) must be > 0`);
        }
        
        // Get fromWallet
        let fromWallet;
        if (fromID) {
            fromWallet = await Wallet.queryWalletByID(ctx, fromID);

            if (!fromWallet) {
                throw new Error(`${fromID} does not exist`);
            }
        } else {
            throw new Error(`fromID is undefined`);
        }

        let toWallet;
        if (toID) {
            toWallet = await Wallet.queryWalletByID(ctx, toID);

            if (!toWallet) {
                throw new Error(`${toID} does not exist`);
            }
        } else {
            throw new Error(`toID is undefined`);
        }

        let cid = new ClientIdentity(ctx.stub);
        if (!fromWallet.txOrgHasPermission(cid.getMSPID())) {
            throw new Error(`${cid.getMSPID()} does not own ${fromID}`);
        }

        if (!fromWallet.canSpendAmount(amount)) {
            throw new Error(`${fromID} does not have enough amount. Required: ${amount}, Available:${fromWallet.amount}`);
        }

        fromWallet.addAmount(-amount);
        toWallet.addAmount(amount);

        console.info(`Transfering ${amount} from ${fromWallet.id} to ${toWallet.id}`);

        return Promise.all([
            fromWallet.save(ctx),
            toWallet.save(ctx)
        ]).then(([from, to]) => {
            return {
                'from': from,
                'to': to
            };
        });
    }

    /**
     * @param {Stub} ctx
     * @param {String} id the id of the wallet that should receive the coins
     * @param {Float} amount amount of coins to create
     */
    async createCoins(ctx, id, amount) {
        let cid = new ClientIdentity(ctx.stub);
        console.info(`Contract owner is: ${this.managingOrgMSP}`);
        if(cid.getMSPID() != this.managingOrgMSP) {
            throw new Error(`${cid.getMSPID()} does not nown contract and therefor can't create coins!`);
        }

        amount = parseInt(amount);
        if(amount <= 0) {
            throw new Error(`amount(${amount}) must be > 0`);
        }

        const wallet = await Wallet.queryWalletByID(ctx, id);
        if(!wallet) {
            throw new Error(`Could not find wallet with id: ${id}!`);
        }

        wallet.addAmount(amount);

        return await wallet.save(ctx);
    }

    /**
     * @param {Stub} ctx
     * @param {String} id the id of the wallet that should spend coins
     * @param {Float} amount amount of coins to spend
     */
    async spendCoins(ctx, id, amount) {
        let cid = new ClientIdentity(ctx.stub);
        console.info(`Contract owner is: ${this.managingOrgMSP}`);
        if(cid.getMSPID() != this.managingOrgMSP) {
            throw new Error(`${cid.getMSPID()} does not nown contract and therefor can't spend coins!`);
        }

        amount = parseInt(amount);
        if(amount <= 0) {
            throw new Error(`amount(${amount}) must be > 0`);
        }

        const wallet = await Wallet.queryWalletByID(ctx, id);
        if(!wallet) {
            throw new Error(`Could not find wallet with id: ${id}!`);
        }

        if(wallet.amount < amount) {
            throw new Error(`Not enough coins to spend in: ${id}!`);
        }
        wallet.addAmount(-amount);

        return await wallet.save(ctx);
    }
}

module.exports = CoinContract;