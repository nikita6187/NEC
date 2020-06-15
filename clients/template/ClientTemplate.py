import flask
from flask import request, jsonify
import requests


# Flask config
app = flask.Flask(__name__)
app.config["DEBUG"] = True
local_port = 12000

# Other client URL config
addr_oo = "localhost:11500"
addr_mo_server = "localhost:11600"
addr_mo_user_api = "localhost:11620"
addr_mo_dc_api = "localhost:11640"
addr_dc = "localhost:11700"
addr_user = "localhost:11800"
addr_agg = "localhost:11900"


# HF connection config
add_hf_api = "localhost:4000"
# See /fabric/api-2.0/quicktest_api.py for example how to contact HF API via python


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


# Helper code

# Super hacky fire and forget HTTP calls
def fire_and_forget(to_get, url, data, headers, params):
    try:
        if to_get:
            # Get request
            requests.get(url, params=params, headers=headers, timeout=0.0000000001)
        else:
            # Post request
            requests.post(url, headers=headers, data=data, timeout=0.0000000001)
    except requests.exceptions.ReadTimeout:
        pass


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
    app.run(port=local_port)

