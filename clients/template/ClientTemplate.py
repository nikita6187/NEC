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
org_id = 1  # TODO: change this appropriatly
# See /fabric/api-2.0/quicktest_api.py for example how to contact HF API via python


# Helper code
pool = Pool(10)


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


def register_hf_api_token():
    url_users = addr_hf_api + "/users"
    org_str = "Org" + str(org_id)
    username = "default_user"
    json_users = {"username": username, "orgName": org_str}
    r = requests.post(url_users, data=json_users)
    token = r.json()['token']
    r.close()
    return token


# Logic class
class TemplateLogic(object):

    def __init__(self):
        self.internal_var = None

    def set_var(self, new_value):
        # Do some processing or whatever
        self.internal_var = new_value

    def get_var(self):
        # Do some processing or whatever
        return self.internal_var


# Logic instance
logic = TemplateLogic()


# Endpoint management

@app.route('/get_value/', methods=['GET'])
def get_value():
    return jsonify(internal_var=logic.get_var())


@app.route('/set_value/', methods=['POST'])
def set_value():
    try:
        # If you need to do other HTTP calls, use fire_and_forget
        body = request.get_json(force=True)
        new_val = body['new_val']
        print("New value: " + str(new_val))
        logic.set_var(new_val)
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
    app.run(port=local_port)

