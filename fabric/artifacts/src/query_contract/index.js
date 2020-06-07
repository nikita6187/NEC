/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const query_contract = require('./lib/query_contract');

module.exports.query_contract = query_contract;
module.exports.contracts = [ query_contract ];
