import flask
from flask import request, jsonify
import requests
from multiprocessing.dummy import Pool


# Flask config
app = flask.Flask(__name__)
app.config["DEBUG"] = True
local_port = 12000

# Other client URL config
addr_oo = "localhost:11500"
addr_mo_server = "localhost:11600"
addr_mo_user_api = "localhost:11620"
addr_dc = "localhost:11700"
addr_user = "localhost:11800"
addr_agg = "localhost:11900"


# HF connection config
addr_hf_api = "localhost:4000"
hf_token = None
org_id = str(1)  # TODO: change this appropriatly
# See /fabric/api-2.0/quicktest_api.py for example how to contact HF API via python


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
    return r.json()


"""
Helper function to invoke async operations i.e. you call the function but do not wait for the response.
function: reference to function to call
args: tuple of args to pass to function
"""
def invoke_async_function(function, args):
    pool.apply_async(function, args)


# Logic class
class OOClientLogic(object):

    def __init__(self):
        self.hf_api_token = None  # str - String of HF API token
        self.query_ids_already_seen = []  # [str] - Query ids that have already been seen, to see which queries are new
        self.query_ids_unprocessed = []  # [str] - query ids of queries that need to be approved/disapproved
        self.query_ids_approved = []  # [str] query ids of approved
        self.query_ids_disapproved = []  # [str] query ids of disapproved

    def add_new_seen_query(self, query_id):
        if query_id not in self.query_ids_already_seen:
            self.query_ids_already_seen.append(query_id)

    def check_if_query_new(self, query_id):
        return query_id in self.query_ids_already_seen

    def check_if_approve_query(self, query_data):
        # This method can be expanded for better automated processing
        return True

    def add_to_unprocessed(self, query_id):
        if query_id not in self.query_ids_unprocessed:
            self.query_ids_unprocessed.append(query_id)

    def process_query_manual(self, query_id, response):
        if response:
            if query_id not in self.query_ids_approved:
                self.query_ids_approved.append(response)
        else:
            if query_id not in self.query_ids_disapproved:
                self.query_ids_disapproved.append(response)


# Logic instance
logic = OOClientLogic()


# Endpoint management

@app.route('/getNewQuery/', methods=['GET'])
def get_new_query():
    all_queries = hf_get(logic.hf_api_token, "query_contract", "getAllQueries", [""])
    for query in all_queries:
        if logic.check_if_query_new(query["query_id"]):
            print("OOClient: new query: " + str(query["query_id"]))
            logic.add_to_unprocessed(query_id=query["query_id"])
    return jsonify(unprocessed_queries=logic.query_ids_unprocessed)


@app.route('/processQuery/', methods=['POST'])
def process_query():
    try:
        # If you need to do other HTTP calls, use fire_and_forget
        body = request.get_json(force=True)
        query_id = body['query_id']
        response = bool(body['response'])

        print("OOClient: add for query: " + str(query_id) + "new response: " + str(response))

        # Process query in local logic
        logic.process_query_manual(query_id, response)

        # Invoke on blockchain
        hf_invoke(logic.hf_api_token, "query_contract", "approveQuery", [str(1 if response else 0)])

        return jsonify(success=True)
    except Exception as e:
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
    hf_token = register_hf_api_token()  # TODO: test
    logic.hf_api_token = hf_token
    app.run(port=local_port)
