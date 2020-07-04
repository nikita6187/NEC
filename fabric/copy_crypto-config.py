import os
import shutil

def copy_cryptoconfig():
    path_to_cryptoconfig = os.path.join('./', 'artifacts', 'channel', 'crypto-config')
    path_to_destination = os.path.join('./', 'blockchainExplorer', 'crypto-config')

    if os.path.exists(path_to_destination) and os.path.isdir(path_to_destination):
        shutil.rmtree(path_to_destination)

    shutil.copytree(path_to_cryptoconfig, path_to_destination)

if __name__ == '__main__':
    copy_cryptoconfig()
