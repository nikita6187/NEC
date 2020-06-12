'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

// Some constants
const num_majority = 1;
const mo_id = "org1";
const dc_id = "org2";
const oo_id = "org3"; 
//const oo_id = "org1"; // UNCOMMENT FOR TESTING IF BUGS ARISE WITH ORG3
var query_stages = {
    1: "awaiting_approval",
    2: "approved",
    3: "checking_users",
    4: "serving_data",
    5: "served",
    6: "failed"
};

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
                fail_message: '',
            },
        ];

        await ctx.stub.putState('q1', Buffer.from(JSON.stringify(queries[0])));

        // Counter for ids
        let init = 2
        await ctx.stub.putState('counter', Buffer.from(init.toString()));  // Hacky solution
            

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
            fail_message: '',
        };
        
        await ctx.stub.putState(query_id, Buffer.from(JSON.stringify(query)));
        console.info('============= END : Create Query ===========');
        return query_id;
    }


    async approveQuery(ctx, query_id, approved){
        // Note, approved should be 1 (=true) or 0 (=false)

        let cid = new ClientIdentity(ctx.stub);

        if(cid.assertAttributeValue('hf.Affiliation', oo_id + '.department1')){
            
            // TODO: check that each oversight organization has voted max 1 time
            // TODO: add reason field for approved = false
            
            // Get query
            const queryAsBytes = await ctx.stub.getState(query_id); 
            if (!queryAsBytes || queryAsBytes.length === 0) {
                throw new Error(`${query_id} does not exist`);
            }
            
            const query = JSON.parse(queryAsBytes.toString());
            
            // TODO: add conversion to boolean

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


    async setQueryStage(ctx, query_id, stage, fail_message = ""){
        // 1. Awaiting approval (directly once the query is created by DC)
        // 2. Approved (after a majority of approvals but before min user check by MO)
        // 3. Checking users (by MO)
        // 4. Serving data (users send data to aggregator) i.e. enough users
        // 5. Served (agg answer on the blockchain; considered archived)
        // 6. Failed

        let newStage = parseInt(stage);
        let no_stages = Object.getOwnPropertyNames(query_stages).length;

        if (newStage < 1 || newStage > no_stages) {
            throw new Error('Stage number invalid!');
        }

        let cid = new ClientIdentity(ctx.stub);

        if(cid.assertAttributeValue('hf.Affiliation', mo_id + '.department1')){
            
            // Get query
            const queryAsBytes = await ctx.stub.getState(query_id); 
            if (!queryAsBytes || queryAsBytes.length === 0) {
                throw new Error(`${query_id} does not exist`);
            }
            
            const query = JSON.parse(queryAsBytes.toString());

            // Basic double checks
            if(query.stage >= 2 && query.num_approve < query.num_majority){
                throw new Error('Not enough approvals for stage 2 or later!');
            }
            
            // TODO: do checks for later stages

            // For fail state, add Fail message to the query
            if (query_stages[newStage] == "failed") {
                query.fail_message = fail_message;
            }
            var
            // Set stage
            query.stage = newStage;
            
            // Put it back
            await ctx.stub.putState(query.query_id, Buffer.from(JSON.stringify(query)));
            

        }  else {
            throw new Error('Not Managing Organization credentials!');
        }
    }

    
}

module.exports = QueryContract;