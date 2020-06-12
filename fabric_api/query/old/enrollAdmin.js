/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const FabricCAServices = require('fabric-ca-client');
const { Wallets } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const YAML = require('yaml');


async function main() {
    try {

        let org_id = process.argv[2];
        console.log('Setting up for org id: ' + org_id);

        // load the network configuration

        // /home/nikita/TUMunich/DLT4PI/NEC/NEC/fabric/api-2.0/config

        const ccpPath = path.resolve(__dirname, '..', '..', 'fabric', 'api-2.0', 'config', 'connection-org' + org_id + '.yaml');
        const ccp = YAML.parse(fs.readFileSync(ccpPath, 'utf8'));
        

        // Create a new CA client for interacting with the CA.
        const caInfo = ccp.certificateAuthorities['ca.org' + org_id + '.example.com'];
        const caTLSCACerts = caInfo.tlsCACerts.pem;
        const ca = new FabricCAServices(caInfo.url, { trustedRoots: caTLSCACerts, verify: false }, caInfo.caName);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet' + org_id);
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the admin user.
        const identity = await wallet.get('admin');
        if (identity) {
            console.log('An identity for the admin user "admin" already exists in the wallet');
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: 'admin', enrollmentSecret: 'adminpw' });
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org' + org_id + 'MSP',
            type: 'X.509',
        };
        await wallet.put('admin', x509Identity);
        console.log('Successfully enrolled admin user "admin" and imported it into the wallet');


    } catch (error) {
        console.error(`Failed to enroll admin user "admin": ${error}`);
        process.exit(1);
    }
}

main();
