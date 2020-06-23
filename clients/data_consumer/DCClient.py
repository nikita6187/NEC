import flask
from flask import request, jsonify
import requests
from multiprocessing.dummy import Pool
from cryptography.fernet import Fernet
import json


# Flask config
app = flask.Flask(__name__)
app.config["DEBUG"] = True
local_port = 11700

# Other client URL config
addr_oo = "http://localhost:11500"
addr_mo_server = "http://localhost:11600"
addr_mo_user_api = "http://localhost:11620"
addr_dc = "http://localhost:11700"
addr_user = "http://localhost:11800"
addr_agg = "http://localhost:11900"


# HF connection config
addr_hf_api = "http://localhost:4000"
org_id = str(1)  # TODO: needs to be changed to ??????????????????????

# Helper code
pool = Pool(10)

"""
Function to call a HTTP request async and only printing the result.
to_get: Bool, True = GET, False = POST
url: string URL to call
data: list/dict for POST data
headers: list/dict of headers
params: list/dict for GET params
"""
def fire_and_forget(to_get, url, data=[], headers=[], params=[]):
    # Example: fire_and_forget(True, "https://www.google.com/")

    def on_success(r):
        if r.status_code == 200:
            print(f'Call succeed: {r}')
        else:
            print(f'Call failed: {r}')

    def on_error(ex: Exception):
        print(f'Requests failed: {ex}')

    if to_get:
        pool.apply_async(requests.get, (url,), {'params': params, 'headers': headers},
                         callback=on_success, error_callback=on_error)
    else:
        pool.apply_async(requests.post, (url,), {'data': data, 'headers': headers},
                         callback=on_success, error_callback=on_error)


"""
Returns a HF API token needed for communication.
return: string of token
"""
def register_hf_api_token():
    # NOTE: not tested fully
    url_users = addr_hf_api + "/users"
    org_str = "Org" + str(org_id)
    username = "default_user_agg"
    json_users = {"username": username, "orgName": org_str}
    r = requests.post(url_users, data=json_users)
    token = r.json()['token']
    r.close()
    return token


"""
Function to invoke (= HTTP POST) something from a chaincode via the HF API.
token: token which is returned by register_hf_api_token
chaincode_name: name of chaincode
function: function name
args: list of string args
returns: json of response
"""
def hf_invoke(token, chaincode_name, function, args):
    # NOTE: not tested fully
    url_post = addr_hf_api + "/channels/mychannel/chaincodes/" + chaincode_name
    body = {"fcn": function,
            "peers": "peer0.org" + org_id + ".example.com",
            "chaincodeName": chaincode_name,
            "channelName": "myChannel",
            "args": args}
    headers = {"Authorization": "Bearer " + token}
    r = requests.post(url_post, data=body, headers=headers)
    return r.json()


"""
Function to get something from a chaincode via the HF API.
token: token which is returned by register_hf_api_token
chaincode_name: name of chaincode
function: function name
args: list of string args
returns: json of response
"""
def hf_get(token, chaincode_name, function, args):
    # NOTE: not tested fully
    headers = {"Authorization": "Bearer " + token}
    params = {"args": args,
              "peer": "peer0.org" + org_id + ".example.com",
              "fcn": function}
    url_req = addr_hf_api + "/channels/mychannel/chaincodes/" + chaincode_name
    r = requests.get(url_req, headers=headers, params=params)
    return r.json()


"""
Helper function to invoke async operations i.e. you call the function but do not wait for the response.
function: reference to function to call
args: tuple of args to pass to function
"""
def invoke_async_function(function, args):
    pool.apply_async(function, args)


# Logic class
#NOTHING TESTED
class DCClientLogic(object):

    def __init__(self):
        self.hf_api_token = None  # str - String of HF API token
        self.walletID = None # ?????
        self.queryId = None # int - Query's id
        self.answerId = None # int - Aggreagated data answer id
        self.priv_key = None # Private keys of aggregated data
        self.aggregatedUnencryptedData = None # Aggregated unencrypted data

    def createQuery(self, queryText, minUsers, maxBudget):
        #create query and put it on HF, save the queryID as well. We need it later to check query's stage

        hf_res = hf.invoke(logic.hf_api_token, "query_contract", "createQuery", [queryText,
                                                                                minUsers,
                                                                                maxBudget,
                                                                                walletID])

        self.queryId = hf_res['result']['message']
        return queryId

    def checkQuery(self):
        #check the query's stage on the HF

        query_stage = hf_get(self.hf_api_token, "query_contract", "getQuery", [queryId])['result']['result']['stage']

        switcher = {
            0: "FAILED"
            1: "AWAITING_APPROVAL"
            2: "APPROVED"
            3: "CHECKING_USERS"
            4: "SERVING_DATA"
            5: "SERVED"
        }

        return switcher.get(query_stage, "Invalid query stage, ERROR!")

    def getAggAnswerFromHF(self):
        #get agg answer from HF, then decrypt it and save it on the logic class

        hf_res = hf_get(logic.hf_api_token, "aggregated_answer_contract", "getAnswer", [answerId])

        aggregatedEncryptedAnswer = hf_res['result']['result']

        cipher_suite = Fernet(priv_key)
        aggregatedUnencryptedData = cipher_suite.decrypt(encrypted_data)
        
        return aggregatedUnencryptedData

# Logic instance
logic = DCClientLogic()


# Endpoint management
#NOTHING TESTED
@app.route('/createQuery/', methods=['POST'])
def createQuery():
    #just call the logic's createQuery function with the arguments passed to the endpoint

    try:
        body = body = request.get_json(force=True)

        queryText = body['query_text']
        minUsers = body['min_users']
        maxBudget = body['max_budget']
        query_id = logic.createQuery(queryText, minUsers, maxBudget)

        print("Added query from: " + str(logic.walletID) + ", the created query has id: " + 
            str(query_id))

      return jsonify(success=True)
    except Exception as e:
        return jsonify(error=str(e))


@app.route('/checkQueryStage/', methods=['GET'])
def checkQueryStage():
    #just call the logic's checkQuery function

    queryStage = logic.checkQuery()

    print("Query stage is " + queryStage)

    return jsonify(stage=queryStage)


@app.route('/receiveAggAnswer/', methods=['POST'])
def receiveKeyAndAnsId():
    #receive privateKey and answer id from the AggregatorClient; save them on the logic class

    try:
        body = body = request.get_json(force=True)
        logic.answerId = body.get['answer_id']
        logic.priv_key = body.get['key']

        print("Answer Id received: " + str(logic.answerId) + ", Private key received: " + str(logic.priv_key))

        return jsonify(success=True)
    except Exception as e:
        return jsonify(error=str(e))


@app.route('/getAnswerFromHF/')
def getAggAnswerFromHF():
    #just call the logic's getAggAnswerFromHF function and return the decrypted data

    unencryptedData = logic.getAggAnswerFromHF()

    print("Aggregated unencrypted answer is: " + str(unencryptedData))

    return jsonify(data=unencryptedData)


@app.errorhandler(500)
def page_not_found(e):
    return jsonify(error=str(e))


@app.errorhandler(404)
def page_not_found(e):
    return jsonify(error=str(e))


@app.errorhandler(403)
def page_not_found(e):
    return jsonify(error=str(e))


if __name__ == '__main__':
    hf_token = register_hf_api_token()
    logic.hf_api_token = hf_token
    app.run(port=local_port)