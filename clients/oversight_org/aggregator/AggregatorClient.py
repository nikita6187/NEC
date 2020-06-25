import flask
from flask import request, jsonify
import requests
from multiprocessing.dummy import Pool
import random
from cryptography.fernet import Fernet
import json


# Flask config
app = flask.Flask(__name__)
app.config["DEBUG"] = True
local_port = 11900

# Other client URL config
addr_oo = "http://localhost:11500"
addr_mo_server = "http://localhost:11600"
addr_mo_user_api = "http://localhost:11620"
addr_dc = "http://localhost:11700"
addr_user = "http://localhost:11800"
addr_agg = "http://localhost:11900"


# HF connection config
addr_hf_api = "http://localhost:4000"
org_id = str(1)  # TODO: needs to be changed to 3
agg_answer_name = "agg_answer"

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
class AggregatorLogic(object):

    def __init__(self):
        self.hf_api_token = None  # str - String of HF API token
        self.query_data_dic = {}  # {query_id : [str]} - Dict, each key being query_id and value being list of user data
        self.query_wallet_dic = {}  # {query_id: [str]} - Dict , each key being query_id and value being list of user wallets
        self.queries = {}  # {query_id: {query}} - Dict containing query_id and query
        self.query_private_keys = {}  # {query_id: str} - query_id and corresponding private key
        self.query_encr_data = {}  # {query_id: str} - query_id and corresponding encrypted data

    def add_user_data(self, data, user_wallet_id, query_id):
        # check if query already exists
        if query_id not in self.queries:
            self.query_data_dic[query_id] = []
            self.query_wallet_dic[query_id] = []
            # get data from HF and add to self.queries
            self.queries[query_id] = hf_get(self.hf_api_token, "query_contract", "getQuery", [query_id])['result']
            self.queries[query_id] = json.loads(self.queries[query_id]['result'])
            # TODO: add check for errors here

        # check if already data there
        if user_wallet_id in self.query_wallet_dic[query_id]:
            return

        # add in data
        self.query_wallet_dic[query_id].append(user_wallet_id)
        self.query_data_dic[query_id].append(data)

    def aggregate_data(self, query_id):
        # Here we can insert some proper aggregation
        # Currently, we assume 1 user, i.e. 1 result and one
        return random.uniform(0.5, 1.5), [(self.query_wallet_dic[query_id][0], self.queries[query_id]['max_budget'])]

    def encrypt_data(self, raw_data, query_id):
        priv_key = Fernet.generate_key()
        cipher_suite = Fernet(priv_key)
        encrypted_data = cipher_suite.encrypt(str.encode(str(raw_data)))
        encrypted_data = str(encrypted_data)
        # To decrypt, run: data = cipher_suite.decrypt(encrypted_data)
        self.query_private_keys[query_id] = priv_key
        self.query_encr_data[query_id] = encrypted_data
        print("Private key: " + str(priv_key))
        return priv_key, encrypted_data

    def send_priv_key_to_mo_dc(self, priv_key, query_id, ans_id):
        # First MO
        url_mo = addr_mo_server + "/receiveAggAnswerKey/"
        json_data = {"query_id": query_id, "key": priv_key}
        r = requests.post(url_mo, json=json_data)
        print(r.json())
        r.close()

        # Next DC
        url_dc = addr_dc + "/receiveAggAnswer/"
        json_data = {"query_id": query_id, "key": priv_key}
        r = requests.post(url_dc, json=json_data)
        print(r.json())
        r.close()


# Logic instance
logic = AggregatorLogic()


# Endpoint management

@app.route('/putAggDataOnBlockchain/', methods=['POST'])
def put_data_on_blockchain():
    # TODO: add try and except

    body = request.get_json()
    query_id = body['query_id']

    # aggregate data
    agg_data, user_compensation = logic.aggregate_data(query_id)

    # encrypt data
    priv_key, encr_data = logic.encrypt_data(agg_data, query_id)

    # put data on blockchain
    hf_res = hf_invoke(logic.hf_api_token, agg_answer_name, "createAnswer", [encr_data,
                                                                             logic.queries[query_id]['wallet_id'],
                                                                             query_id, user_compensation])
    ans_id = hf_res['result']['message']
    # TODO: add checks for HF result

    # send private keys to MO and DC
    logic.send_priv_key_to_mo_dc(priv_key=priv_key, query_id=query_id, ans_id=ans_id)

    print("Agg: aggregated answer, put on BC and sent priv keys. Ans id: " + str(ans_id))

    return jsonify(answerID=ans_id)


@app.route('/receiveData/', methods=['POST'])
def receive_data():
    try:
        body = request.get_json()
        data = body['user_data']
        user_wallet_id = body['user_wallet_id']
        query_id = body["query_id"]
        logic.add_user_data(data=data, user_wallet_id=user_wallet_id, query_id=query_id)

        print("Agg: Added new data from: " + str(user_wallet_id) + " with data: " + str(data) + " for query: " +
              str(query_id))

        return jsonify(success=True)
    except Exception as e:
        print(e)
        return jsonify(error=str(e))


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

