

# TODO: something less stupid
docker stop $(docker ps -a -q)
docker rm $(docker ps -a -q)


# Remove some old files
# TODO: update this
#rm -rf channel-artifacts/* log.txt
rm channel-artifacts/mychannel.block log.txt


# TODO: add more parameters from networkDown

