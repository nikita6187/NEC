/*
 * Copyright IBM Corp. All Rights Reserved.
 *
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const AggAnswerContract = require('./lib/aggregated_answer_contract');

module.exports.query_contract = AggAnswerContract;
module.exports.contracts = [ AggAnswerContract ];
