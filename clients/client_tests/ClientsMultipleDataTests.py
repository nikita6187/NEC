import requests
import time

addr_mo = "http://localhost:11600"
addr_dc = "http://localhost:11700"
addr_user = "http://localhost:11800"

start = time.time()
for i in range(500):
    r = requests.post(addr_user + '/sendData/')
end = time.time()
print("Time elapsed to send data from 500 users: " + str(end - start))
