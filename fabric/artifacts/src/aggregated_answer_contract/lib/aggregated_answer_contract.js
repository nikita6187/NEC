'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

// Some constants
const num_majority = 1;
const mo_id = "org1";
const dc_id = "org2";
//const oo_id = "org3"; // TODO: COMMENT BACK OUT!!!!!!!!!!!!!!!!!!!!!!!!!!!
const oo_id = "org3"; // UNCOMMENT FOR TESTING IF BUGS ARISE WITH ORG3
const cc_query_name = "query_contract";
const cc_coin_name = "coin_contract";
const channel_name = "mychannel";


class AggAnswerContract extends Contract {
    

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');

        // demo
        const queries = [
            {
                answer_id: 'a1',
                query_id: 'q1', 
                dc_wallet: 'wallet1',
                encr_answer_text: 'blablabla',
                user_wallet_list: [{'wallet': 'wallet2', 'amount': 10}],
            },
        ];

        await ctx.stub.putState('q1', Buffer.from(JSON.stringify(queries[0])));

        // Counter for ids
        let init = 2
        await ctx.stub.putState('counter', Buffer.from(init.toString()));  // Hacky solution
            

        console.info('============= END : Initialize Ledger ===========');
    }

    async getAnswer(ctx, answer_id) {

        const answerAsBytes = await ctx.stub.getState(answer_id); // get the query from chaincode state
        if (!answerAsBytes || answerAsBytes.length === 0) {
            throw new Error(`${answer_id} does not exist`);
        }

        console.log(answerAsBytes.toString());
        return answerAsBytes.toString();
    }

    async createAnswer(ctx, encr_answer_text, dc_wallet, query_id, user_wallet_list) {
        console.info('============= START : Create Answer ===========');
        let cid = new ClientIdentity(ctx.stub);


        if(cid.assertAttributeValue('hf.Affiliation', oo_id + '.department1')){

            // convert use_wallet_list appropriatly
           // user_wallet_list = JSON.parse(user_wallet_list);  // TODO: check if appropriate
            console.log(user_wallet_list);
            const rID1 = await ctx.stub.getState('counter');
            let rID = rID1.toString();
            await ctx.stub.putState('counter', Buffer.from((parseInt(rID) + 1).toString()));  // Increase counter for uniqueness

            let answer_id = 'a' + rID;

            const answer = {
                answer_id: answer_id,
                query_id: query_id, 
                dc_wallet: dc_wallet,
                encr_answer_text: encr_answer_text,
                user_wallet_list: user_wallet_list,
            };

            // TODO: automatically transfer funds via Coin contract
            // TODO: find out which CC to call
            user_wallet_list = JSON.parse(user_wallet_list)
            
            for(var wallet_key of Object.keys(user_wallet_list)) {
                console.info(`Performing for wallet pair: ${user_wallet_list[wallet_key]} ${wallet_key}`);
                // TODO: error:  The first argument must be of type string or an instance of Buffer, ArrayBuffer, or Array or an Array-like Object. Received type number (10)
                // transaction returned with failure: TypeError [ERR_INVALID_ARG_TYPE]:
                let amount = user_wallet_list[wallet_key];
                amount = amount.toString();
                const args = ["transfer", amount, wallet_key, dc_wallet];
                await ctx.stub.invokeChaincode(cc_coin_name, args, channel_name);
            }

            

            // set served stage (nr 5) for query
            // TODO: check if works
            // TO call setQueryStage currently you need the MO credentials, so this shouldn't work
            const args = ["setQueryStage", query_id, "5", ""];
            await ctx.stub.invokeChaincode(cc_query_name, args, channel_name);

            await ctx.stub.putState(query_id, Buffer.from(JSON.stringify(answer)));
            console.info('============= END : Create Answer ===========');
            return answer_id;

        } else {
            // error if not OO
            throw new Error('Not Oversight Organization credentials!');
        }
    }

    
}

module.exports = AggAnswerContract;