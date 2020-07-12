import collections as ct
import json
from multiprocessing.dummy import Pool

import requests
from cryptography.fernet import Fernet

import flask
from flask import jsonify, request, make_response
from flask_cors import CORS, cross_origin

import sys

# Flask config
app = flask.Flask(__name__)
cors = CORS(app)
app.config["DEBUG"] = True
local_port = 11600

addr_oo = "http://localhost:11500"
addr_mo_server = "http://localhost:11600"
addr_mo_user_api = "http://localhost:11620"
addr_dc = "http://localhost:11700"
addr_user = "http://localhost:11800"
addr_agg = "http://localhost:11900"


# HF connection config
addr_hf_api = "http://localhost:4000"
org_id = str(1)

# Helper code
pool = Pool(10)

# logging
@app.before_request
def store_requests():
    url = request.url
    if "getRequestsHistory" not in url and "getQueryData" not in url and "getAllQueries" not in url and "getAllWallets" not in url:
        logic.requests_log.append(url)

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
    id_counter = 0
    def __init__(self, cost, details):
        # self.id_counter += 1
        # self.id = "r" + self.id_counter
        self.cost = cost
        self.details = details

# Logic class
class MoClientLogic(object):

    def __init__(self):
        self.hf_token = None
        # List of all userIds in the system
        self.users = []
        self.users.append("u1")
        # List of all dcIds in the system
        self.dc = []
        self.dc.append("dc1")

        # Maps KEY: UserId - VALUE: list of WalletId
        # defaultdict behaves lke a normal dict with extra protection agains errors esp. when adding missing keys
        self.wallet_map = ct.defaultdict(list)
        # Maps KEY: QueryId - VALUE: list of participating UserId
        self.query_participants_map = ct.defaultdict(list)

        # Maps KEY: QueryId - VALUE: private key
        self.answer_keys_map = {}
        # Maps KEY: RewardId - VALUE: reward information i.e. another map or a CoinReward class
        self.rewards_map = {}
        # Maps KEY: dc_id - VALUE: wallet associated to the dc
        self.dc_wallet_map = {}
        # List of all api requests
        self.requests_log = []

        # Hardcorded some rewards for the DEMO
        self.rewards_map["r1"] = CoinReward(20, "r1. MVV Single Ticket")
        self.rewards_map["r2"] = CoinReward(55, "r2. MVV Day Ticket")
        self.rewards_map["r3"] = CoinReward(25, "r3. Pinakothek der Moderne - Entry Ticket")



    def get_full_query(self, query_id):
        """Get a dicitonary with full data of the query corresp. to the id

        Args:
            query_id (string): query id

        Returns:
            dict: query data
        """
        try:
            response = hf_get(self.hf_token, "query_contract", "getQuery", [query_id])
            raw = response['result']['result']
            return json.loads(raw)
        except Exception as e:
            return jsonify(erorr = str(e))

    def create_user_wallet(self, user_id):
        """Create a new wallet and then assign it to the user-wallet map

        Args:
            user_id (string): user id

        Returns:
            wallet_id: new wallet id
        """
        # create new wallet
        response = hf_invoke(self.hf_token, "coin_contract", "createWallet", [])
        print("CREATE USER WALLET")
        print(str(response))
        new_wallet = response['result']['result']
        # associate it to user
        self.wallet_map[user_id].append(new_wallet['id'])
        print(new_wallet['id'])
        return new_wallet['id']

    def retrieve_user_wallets(self, user_id):
        """Retrieve all Wallets associated to a user

        Args:
            user_id (string): user id

        Returns:
            wallets: list of dictionaries (KEYS: id, orgMSP, amount) containing Wallet data
        """
        wallets = []
        for wallet_id in self.wallet_map[user_id]:
            response = hf_get(self.hf_token, "coin_contract", "retrieveWallet", [wallet_id])
            wallets.append(json.loads(response['result']['result']))
        return wallets

    def subtract_coins(self, user_id, reward_id):
        """Subtract coins from aggregated wallets of a user
        The amount subtracted is the cost for the reward specified by the reward id

        Args:
            user_id (string): user id
            reward_id (string): reward id
        """
        # retrieve all the user's wallets
        wallets = self.retrieve_user_wallets(user_id)
        reward_cost = self.rewards_map[reward_id].cost
        amount_needed = reward_cost

        print(wallets)
        print(amount_needed)

        for idx, wallet in enumerate(wallets):
            print(wallet)
            amount_needed -= wallet["amount"]
            if amount_needed <= 0:
                # the last wallet has more funds than necessary or amount needed reached
                # we subtract the necessary coins and keep that last wallet
                transfer_sum = amount_needed + wallet["amount"]
                # subtract coins
                self.remove_coins(wallet["id"], transfer_sum)
                break
            else:
                # take all coins from current wallet and remove wallet reference
                self.remove_coins(wallet["id"], wallet["amount"])
                self.wallet_map[user_id].pop(idx)

    def create_coins(self, wallet_id, amount):
        hf_invoke(self.hf_token, "coin_contract", "createCoins", [wallet_id, amount])

    def remove_coins(self, wallet_id, amount):
        print("Remove coins: " + str(wallet_id) + " " + str(amount))
        hf_invoke(self.hf_token, "coin_contract", "spendCoins", ["WAL" + str(wallet_id), amount])

    def ask_users_for_query(self, query_id):
        """Notify all existing users of a new query

        Args:
            query_id (string): query id
            query_text (string): description of query
        """
        query = self.get_full_query(query_id)

        # notify all users of the query
        # currently only one user -> using addr_user instead of each users's unique id
        for user in self.users:
            url_mo = addr_user + "/notify/"
            # TODO: QUERY needs an extra field "query_details" with string information
            # about the query content to be sent to users with the request
            json_data = {"query_id": query_id, "query_text": "Requested by: Technische Universität München; Data usage: Analysis on student activity in campus."}
            r = requests.post(url_mo, json=json_data)
            print(r.json())
            r.close()

    def send_data(self, query_id):
        """Notify all users to send query data to aggregator.
            Should be called (automatically) when the minimum number of required users for a query has been reached
            Currently can be called from endpoint for testing purposes

        Args:
            query_id (string): query id
        """
        for user in self.users:
            #new_wallet = logic.create_user_wallet(user)
            url_mo = addr_user + "/sendData/" #+ query_id + '/' + new_wallet + '/'
            json_data = {"query_id": query_id} #, "wallet_id": new_wallet}
            r = requests.post(url_mo) #, json=json_data)
            print(r.json())
            r.close()




# Logic instance
logic = MoClientLogic()

# Endpoint management

@app.route('/enrollUser/<user_id>', methods=['GET'])
def enroll_user(user_id):
    logic.users.append(user_id)
    return make_response(
        'New User with id: ' + user_id + ' registered successfully!',
        201
    )

@app.route('/enrollDc/<dc_id>', methods=['GET'])
def enroll_dc(dc_id):
    logic.dc.append(dc_id)
    return make_response(
        'New data consumer with id: ' + dc_id + ' registered registered successfully!',
        201
    )

@app.route('/getQuery/<query_id>', methods=['GET', 'POST'])
def get_query(query_id):

    query = logic.get_full_query(query_id)
    logic.ask_users_for_query(query["query_id"])
    return query

@app.route('/getAllQueries', methods=['GET'])
def get_all_queries():
    try:
        response = hf_get(logic.hf_token, "query_contract", "getAllQueries", [" "])
        all_queries = [query_s['Record'] for query_s in json.loads(response['result']['result'])]
        #print(all_queries, file=sys.stderr)
        return jsonify(all_queries)
    except Exception as e:
            return jsonify(erorr = str(e))


@app.route('/getAllWallets', methods=['GET'])
def get_all_wallets():
    try:
        response = hf_get(logic.hf_token, "coin_contract", "retrieveWallets", ["1", "999"])
        all_queries = [query_s['Record'] for query_s in json.loads(response['result']['result'])]
        print(all_queries, file=sys.stderr)
        return jsonify(all_queries)
    except Exception as e:
            return jsonify(erorr = str(e))

@app.route('/setQueryStage/<query_id>/<stage>')
def set_query_stage(query_id, stage):
    try:
        # setQueryStage needs a third argument "failMessage" which we pass as empty
        hf_invoke(logic.hf_token, "query_contract", "setQueryStage", [query_id, stage, ""])
    except Exception as e:
            return jsonify(erorr = str(e))
    # Return query
    return hf_get(logic.hf_token, "query_contract", "getQuery", [query_id])


@app.route('/getQueryAnswer/<query_id>', methods=['GET'])
def get_query_answer(query_id):
    # get query answer for corresponding query_id
    try:
        # get encrypted query answer
        hf_res = hf_get(logic.hf_token, "agg_answer", "getAnswer", [query_id])        # decrypt answer
        aggregated_encrypted_answer = json.loads(hf_res['result']['result'])['encr_answer_text']
        cipher_suite = Fernet(str.encode(logic.answer_keys_map[query_id]))
        data = cipher_suite.decrypt(str.encode(aggregated_encrypted_answer)).decode('utf-8')
        return jsonify(data=data)
    except Exception as e:
        return jsonify(erorr = str(e))

@app.route('/receiveAggAnswerKey/', methods=['POST'])
def receive_answer_pk():
    # Store pk
    body = request.get_json()
    query_id = body['query_id']
    key = body['key']
    logic.answer_keys_map[query_id] = key
    return jsonify(logic.answer_keys_map)

@app.route('/cashinCoins/<user_id>/<reward_id>/', methods=['POST'])
def cashin_coins(user_id, reward_id):
    # subtract coins from user wallet
    #try:
    # adding reward test data
    if reward_id not in logic.rewards_map.keys():
        logic.rewards_map[reward_id] = CoinReward(100, "Default reward text")
    print("Here1: " + str(user_id) + " " + str(reward_id))
    logic.subtract_coins(user_id, reward_id)
    #except Exception as e:
    #    return jsonify(erorr = str(e))
    # send reward to user
    return jsonify(logic.rewards_map[reward_id].cost,
                   logic.rewards_map[reward_id].details)

@app.route('/acceptQuery/<user_id>/<query_id>/', methods=['GET'])
def accept_query(user_id, query_id):
    print("parameters are: " + str(user_id), str(query_id))
    # TODO: add a counter for number of participants for each query. When counter reaches min user number
    # required by query, make a sendData request to all participating users to send data

    # add new participant to query
    logic.query_participants_map[query_id].append(user_id)
    #create new wallet and return it to user
    new_wallet_id = logic.create_user_wallet(user_id)
    # test prints
    #print(jsonify(dict(logic.query_participants_map)), file=sys.stderr)
    #print(jsonify(dict(logic.wallet_map)), file=sys.stderr)
    return {"wallet_id": new_wallet_id}

@app.route('/receiveDCWallet/<dc_id>/<wallet_id>/', methods=['POST'])
def receive_dc_wallet(dc_id, wallet_id):
    # save wallet id to map
    logic.dc_wallet_map[dc_id] = wallet_id
    # add default amount of funds to wallet
    default_amount = 1000
    logic.create_coins(wallet_id, default_amount)
    return jsonify({"amount_added": default_amount})

@app.route('/sendData/<query_id>', methods=['POST'])
def send_data(query_id):
    logic.send_data(query_id)
    return make_response(
        'Users have been notified to send data to aggregator for query with id: ' + query_id + '.',
        201
    )

@app.route('/getRequestsHistory/', methods=['GET'])
def get_requests_history():
    return jsonify({"requests": list(reversed(logic.requests_log))})

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
    token = register_hf_api_token()
    logic.hf_token = token
    app.run(port=local_port, debug=True)
