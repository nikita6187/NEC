import sys
import os.path
import requests

# Note: it requires the pip package requests
# pip3 install requests

# Usage:
# python3 quicktest_api.py <port> <username> 1|2|3(org id) req|post <chaincode> <function_name> <function params>...


def main():
    # First register and connect and get token
    url_users = "http://localhost:" + sys.argv[1] + "/users"
    org_str = "Org" + sys.argv[3]
    username = sys.argv[2]
    json_users = {"username": username, "orgName": org_str}
    r = requests.post(url_users, data=json_users)
    token = r.json()['token']
    r.close()
    # Then invoke/query chaincode and function
    if sys.argv[4] == "req":
        # Query
        headers = {"Authorization": "Bearer " + token}
        args = list(sys.argv[7:])
        params = {"args": args,
                  "peer": "peer0.org" + sys.argv[3] + ".example.com",
                  "fcn": sys.argv[6]}
        url_req = "http://localhost:" + sys.argv[1] + "/channels/mychannel/chaincodes/" + sys.argv[5]
        r = requests.get(url_req, headers=headers, params=params)
        print(r.json())
    else:
        # Invoke
        url_post = "http://localhost:" + sys.argv[1] + "/channels/mychannel/chaincodes/" + sys.argv[5]
        body = {"fcn": sys.argv[6],
                "peers": "peer0.org" + sys.argv[3] + ".example.com",
                "chaincodeName" : sys.argv[5],
                "channelName": "myChannel",
                "args": sys.argv[7:]}
        headers = {"Authorization": "Bearer " + token}
        r = requests.post(url_post, data=body, headers=headers)
        print(r.json())


if __name__ == '__main__':
    main()

