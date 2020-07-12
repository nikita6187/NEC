import yaml
import sys
import os.path
import shutil


def gen_cert(org):
    org = org.lower()
    assert org in ['1', '2', '3'], "Org param not '1', '2', '3'!"

    # Copy the files over
    path_to_connection_template = os.path.join('./','artifacts', 'channel', 'config', 'connection-org' + org + '.yaml')
    path_to_destination = os.path.join('./', 'api-2.0', 'config', 'connection-org' + org + '.yaml')

    shutil.copy(path_to_connection_template, path_to_destination)

    path_to_yaml_config = path_to_destination
    path_to_cert = os.path.join('./', 'artifacts', 'channel', 'crypto-config', 'peerOrganizations',
                                'org' + org + '.example.com', 'tlsca', 'tlsca.org' + org + '.example.com-cert.pem')
    with open(path_to_yaml_config, 'r') as stream:
        try:
            org_yaml = yaml.safe_load(stream)
        except yaml.YAMLError as exc:
            print(exc)

    with open(path_to_cert, 'r') as reader:
        cert = reader.read()

    # Write in cert
    org_yaml['peers']['peer0.org' + org + '.example.com']['tlsCACerts']['pem'] = cert
    org_yaml['certificateAuthorities']['ca.org' + org + '.example.com']['tlsCACerts']['pem'] = cert

    # Save yaml
    with open(path_to_yaml_config, 'w') as file:
        documents = yaml.dump(org_yaml, file)


if __name__ == '__main__':
    gen_cert(sys.argv[1])

