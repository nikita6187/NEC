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

        let cid = new ClientIdentity(ctx.stub);

        return new Wallet(id, cid.getMSPID(), 1000)
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
            fromWallet = Wallet.toClass(fromWallet);

            if (!fromWallet) {
                throw new Error(`${fromID} does not exist`);
            }
        } else {
            throw new Error(`fromID is undefined`);
        }

        let toWallet;
        if (toID) {
            toWallet = await Wallet.queryWalletByID(ctx, toID);
            toWallet = Wallet.toClass(toWallet);

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
}

module.exports = CoinContract;