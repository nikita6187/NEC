import collections as ct
import flask
from flask import request, jsonify
import requests
from multiprocessing.dummy import Pool
import uuid


# Flask config
app = flask.Flask(__name__)
app.config["DEBUG"] = True
local_port = 11620

# Other client URL config
addr_oo = "localhost:11500"
addr_mo_server = "localhost:11600"
addr_mo_user_api = "localhost:11620"
addr_dc = "localhost:11700"
addr_user = "localhost:11800"
addr_agg = "localhost:11900"


# HF connection config
addr_hf_api = "localhost:4000"
org_id = str(1)  # TODO: change this appropriatly

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
    username = "default_user"
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

    # Deal with exceptions for the requests i.e. possible exception from .json() and check for 
    # a possible error response from the request w .raise_for_status()
    return r.json()


"""
Helper function to invoke async operations i.e. you call the function but do not wait for the response.
function: reference to function to call
args: tuple of args to pass to function
"""
def invoke_async_function(function, args):
    pool.apply_async(function, args)

# Coin Reward class
class CoinReward:
    id_counter = 1
    def __init__(self, cost, details):
        id
        self.id = uuid.uuid4()

# Logic class
class MoClientLogic(object):

    def __init__(self):
        self.hf_token = None
        # Maps KEY: UserId - VALUE: list of WalletId
        # defaultdict behaves lke a normal dict with extra protection agains errors esp. when adding missing keys
        self.wallet_map = ct.defaultdict(list)
        # Maps KEY: QueryId - VALUE: list of participating UserId
        self.query_participants_map = {}
        # Maps KEY: QueryId - VALUE: private key
        self.answer_keys_map = {}
        # Maps KEY: RewardId - VALUE: reward information i.e. another map or a Reward class
        self.rewards_map = {}
    
    def create_user_wallet(self, user_id):
        # create new wallet
        new_wallet = hf_invoke(self.hf_token, "coin_contract", "createWallet", [""])
        # associate it to user
        self.wallet_map[user_id].append(new_wallet.id)
        return new_wallet.id

    def subtract_coins(self, user_id, reward_id):
        return None



# Logic instance
logic = MoClientLogic()


# Endpoint management

@app.route('/getQuery/<query_id>', methods=['GET'])
def get_query(query_id):
    try:
        response = hf_get(logic.hf_token, "query_contract", "getQuery", [query_id])
        return jsonify(response)
    except Exception as e:
        return jsonify(erorr = str(e))

@app.route('/getAllQueries', methods=['GET'])
def get_all_queries():
    try:
        response = hf_get(logic.hf_token, "query_contract", "getAllQueries", [" "])
        return jsonify(response)
    except Exception as e:
            return jsonify(erorr = str(e))

@app.route('/setQueryStage/<query_id>/<int:stage>', methods=['POST'])
def set_query_stage(query_id, stage):
    try:
        # setQueryStage needs a third argument "failMessage" which we pass as empty
        hf_invoke(logic.hf_token, "query_contract", "setQueryStage", [query_id, stage, ""])
    except Exception as e:
            return jsonify(erorr = str(e))

@app.route('/getQueryAnswer/<query_id>', methods=['GET'])
def get_query_answer(query_id):
    # get query answer for corresponding query_id
    try:
        # have to update the getAnswer method in the agg_ans contract
        raw_res = hf_get(logic.hf_token, "aggregated_answer_contract", "getAnswer", [query_id])
        # how do we decode the answer: a new method in the agg answer contr?
        # decrypted_res = raw_res
        return jsonify(raw_res)
    except Exception as e:
        return jsonify(erorr = str(e))

@app.route('/receiveAggAnswer')
def receive_answer_pk():
    query_id = request.args.get("query_id")
    pk = request.args.get("key")
    # Store pk
    logic.answer_keys_map[query_id] = pk

@app.route('/cashinCoins/<user_id>/<reward_id>')
def cashin_coins(user_id, reward_id):
    # check and subtract coins from user wallet
    # send reward to user

@app.errorhandler(500)
def page_not_found(e):
    return jsonify(error=str(e))

@app.errorhandler(404)
def page_not_found(e):
    return jsonify(error=str(e))

@app.errorhandler(403)
def page_not_found(e):
    return jsonify(error=str(e))

@app.route('/about')
def about():
    return 'The about page'


if __name__ == '__main__':
    token = register_hf_api_token()  # TODO: test
    logic.hf_token = token
    print("NNNN ",token, " NNNNN")
    app.run(port=local_port)

