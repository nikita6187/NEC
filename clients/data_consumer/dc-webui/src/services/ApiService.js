import {DC_SERVER_HOST,DC_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getRequests() {
    try {
        return axios.get(`http://${DC_SERVER_HOST}:${DC_SERVER_PORT}/getRequestsHistory/`);
    } catch(error) {
        console.error(error);
    }
}

function getQueryStatus(queryId) {
    try {
        return axios.get(`http://${DC_SERVER_HOST}:${DC_SERVER_PORT}/checkQueryStage/` + queryId + `/`);
    } catch(error) {
        console.error(error);
    }
}

function getQueryAnswer(queryId) {
    try {
        return axios.get(`http://${DC_SERVER_HOST}:${DC_SERVER_PORT}/getAnswerFromHF/` + queryId + `/`);
    } catch(error) {
        console.error(error);
    }
}

function createQuery(queryText, minUsers, maxBudget) {
    try {
        let data = JSON.stringify({query_text: queryText, min_users: minUsers, max_budget: maxBudget});
        return axios.post(`http://${DC_SERVER_HOST}:${DC_SERVER_PORT}/createQuery/`, data,
            {headers: {'Content-Type': 'application/json'}});
    } catch(error) {
        console.error(error);
    }
}

export {
    getRequests,
    getQueryStatus,
    getQueryAnswer,
    createQuery
}