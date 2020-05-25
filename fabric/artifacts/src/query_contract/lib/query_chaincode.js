'use strict';

const { Contract } = require('fabric-contract-api');

class QueryContract extends Contract {
    

    async initLedger(ctx) {
        console.info('============= START : Initialize Ledger ===========');
        
        // demo
        const queries = [
            {
                query_id: 'q1',
                query_as_text: 'ALL',
                num_approve: 0,
                num_disapprove: 0,
                min_users: 2,
                stage: 1,
                num_majority: 1,
                max_budget: 10,
                wallet_id: 'w1',
            },
        ];

        await ctx.stub.putState('q1', Buffer.from(JSON.stringify(queries[0])));

        // Counter for ids
        let init = 2
        await ctx.stub.putState('counter', Buffer.from(init.toString()));  // Hacky solution

        // Some constants
        var num_majority = 1;
        var mo_id = "Org1";
        var dc_id = "Org2";
        var oo_id = "Org3";
            

        console.info('============= END : Initialize Ledger ===========');
    }

    async getQuery(ctx, query_id) {

        const queryAsBytes = await ctx.stub.getState(query_id); // get the query from chaincode state
        if (!queryAsBytes || queryAsBytes.length === 0) {
            throw new Error(`${query_id} does not exist`);
        }

        console.log(queryAsBytes.toString());
        return queryAsBytes.toString();
    }

    async createQuery(ctx, query_text, min_users, max_budget, wallet_id) {
        console.info('============= START : Create Query ===========');
        
        
        const rID1 = await ctx.stub.getState('counter');
        let rID = rID1.toString();
        await ctx.stub.putState('counter', Buffer.from((parseInt(rID) + 1).toString()));  // Increase counter for uniqueness

        let query_id = 'q' + rID;

        const query = {
            query_id: query_id, 
            query_as_text: query_text,
            num_approve: 0,
            num_disapprove: 0,
            min_users: min_users,
            stage: 1,
            num_majority: num_majority,
            max_budget: max_budget,
            wallet_id: wallet_id,
        };
        
        await ctx.stub.putState(query_id, Buffer.from(JSON.stringify(query)));
        console.info('============= END : Create Query ===========');
    }


    async approveQuery(ctx, query_id, approved){

        let cid = new ClientIdentity(ctx.stub);

        if(cid.assertAttributeValue('hf.Affiliation', oo_id + '.department1')){
            
            // TODO: check that each oversight organization has voted max 1 time
            // TODO: add reason field for approved = false
            
            // Get query
            const queryAsBytes = await ctx.stub.getState(query_id); // get the car from chaincode state
            if (!queryAsBytes || queryAsBytes.length === 0) {
                throw new Error(`${query_id} does not exist`);
            }
            
            const query = JSON.parse(queryAsBytes.toString());

            // We add vote
            if(approved == true){
                query.num_approve += 1;
            } else {
                query.num_disapprove += 1;
            }

            // Automatically check query stage
            if(query.num_approve >= query.num_majority && query.stage == 1){
                query.stage = 2;  // TODO: maybe use setQueryStage? check if HF ok with this
            }
            
            // Put it back
            await ctx.stub.putState(query.query_id, Buffer.from(JSON.stringify(query)));
            

        }  else {
            throw new Error('Not Oversight Organization credentials!');
        }
    }


    async setQueryStage(ctx, query_id, stage){

        // Stage 1 = New query looking for approval
        // Stage 2 = Approved query, waiting for response of min users
        // Stage 3 = Min users reached, waiting for data transfer
        // Stage 4 = Archived
        // Stage 5 = Error

        let cid = new ClientIdentity(ctx.stub);

        if(cid.assertAttributeValue('hf.Affiliation', mo_id + '.department1')){
            
            // Get query
            const queryAsBytes = await ctx.stub.getState(query_id); // get the car from chaincode state
            if (!queryAsBytes || queryAsBytes.length === 0) {
                throw new Error(`${query_id} does not exist`);
            }
            
            const query = JSON.parse(queryAsBytes.toString());

            // Basic double checks
            if(query.stage >= 2 && query.num_approve < query.num_majority){
                throw new Error('Not enough approvals for stage 2 or later!');
            }
            
            // TODO: do checks for later stages

            // Set stage
            query.stage = stage;
            
            // Put it back
            await ctx.stub.putState(query.query_id, Buffer.from(JSON.stringify(query)));
            

        }  else {
            throw new Error('Not Managing Organization credentials!');
        }
    }

    
}

module.exports = QueryContract;