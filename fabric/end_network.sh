

# TODO: something less stupid
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)