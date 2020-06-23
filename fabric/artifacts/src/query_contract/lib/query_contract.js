'use strict';

const { Contract } = require('fabric-contract-api');
const ClientIdentity = require('fabric-shim').ClientIdentity;

// Some constants
const num_majority = 1;
const mo_id = "org1";
const dc_id = "org2";
const oo_id = "org3"; 
//const oo_id = "org1"; // UNCOMMENT FOR TESTING IF BUGS ARISE WITH ORG3

// 1. Awaiting approval (directly once the query is created by DC)
// 2. Approved (after a majority of approvals but before min user check by MO)
// 3. Checking users (by MO)
// 4. Serving data (users send data to aggregator) i.e. enough users
// 5. Served (agg answer on the blockchain; considered archived)
// 0. failed (various reasons for query failure - reason stored in "fail_message" field in Query)
let query_stages = {
    0: "FAILED",
    1: "AWAITING_APPROVAL",
    2: "APPROVED",
    3: "CHECKING_USERS",
    4: "SERVING_DATA",
    5: "SERVED"
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
        let init = 2;
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

    async getAllQueries(ctx) {
        const startKey = 'q1';
        const endKey = 'q999';
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
            if(approved === true){
                query.num_approve += 1;
            } else {
                query.num_disapprove += 1;
            }

            // Automatically check query stage
            if(query.num_approve >= query.num_majority && query.stage === 1){
                query.stage = 2;  // TODO: maybe use setQueryStage? check if HF ok with this
            }
            
            // Put it back
            await ctx.stub.putState(query.query_id, Buffer.from(JSON.stringify(query)));
            

        }  else {
            throw new Error('Not Oversight Organization credentials!');
        }
    }


    async setQueryStage(ctx, query_id, stage, fail_message){

        let newStage = parseInt(stage);
        // Check if the new stage value can be converted to int
        if (isNaN(newStage)){
            throw new Error('New stage value is not a valid integer!')
        }

        let no_stages = Object.getOwnPropertyNames(query_stages).length;
        // Check newStage value is in the valid range
        if (newStage < 0 || newStage >= no_stages) {
            throw new Error('New stage integer is not in the valid range!');
        }

        let cid = new ClientIdentity(ctx.stub);

        if(cid.assertAttributeValue('hf.Affiliation', mo_id + '.department1')){
            
            // Get query
            const queryAsBytes = await ctx.stub.getState(query_id); 
            if (!queryAsBytes || queryAsBytes.length === 0) {
                throw new Error(`${query_id} does not exist`);
            }
            
            const query = JSON.parse(queryAsBytes.toString());

            // Checks that verify if the change of the query state is valid

            // If the query doesn't have approval majority, throw error if trying to change state to "approved"
            if(query_stages[newStage] === "APPROVED" && query.num_approve < query.num_majority){
                throw new Error('Not enough approvals in order to change Query stage to APPROVED!');
            }

            // For FAILED state, add fail_message to the query
            if (query_stages[newStage] === "FAILED") {
                query.fail_message = fail_message;
            }

            // TODO: do checks for later stages
    
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