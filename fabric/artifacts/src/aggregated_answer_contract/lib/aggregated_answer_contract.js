'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

// Some constants
const num_majority = 1;
const mo_id = "org1";
const dc_id = "org2";
const oo_id = "org3"; 
//const oo_id = "org1"; // UNCOMMENT FOR TESTING IF BUGS ARISE WITH ORG3


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

        await ctx.stub.putState('a1', Buffer.from(JSON.stringify(queries[0])));

        // Counter for ids
        let init = 2
        await ctx.stub.putState('counter', Buffer.from(init.toString()));  // Hacky solution
            

        console.info('============= END : Initialize Ledger ===========');
    }

    async getAnswer(ctx, answer_id) {

        const answerAsBytes = await ctx.stub.getState(query_id); // get the query from chaincode state
        if (!answerAsBytes || answerAsBytes.length === 0) {
            throw new Error(`${answer_id} does not exist`);
        }

        console.log(answerAsBytes.toString());
        return answerAsBytes.toString();
    }



    async createAnswer(ctx, encr_answer_text, dc_wallet, query_id, user_wallet_list) {
        console.info('============= START : Create Answer ===========');
        
        // convert use_wallet_list appropriatly
        user_wallet_list = JSON.parse(user_wallet_list);  // TODO: check if appropriate
        
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

        // TODO: set stage for query
        
        await ctx.stub.putState(answer_id, Buffer.from(JSON.stringify(answer)));
        console.info('============= END : Create Answer ===========');
        return answer_id;
    }

    
}

module.exports = AggAnswerContract;