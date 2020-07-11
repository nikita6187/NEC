import {MO_SERVER_HOST, MO_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getRequests() {
    try {
        return axios.get(`http://${MO_SERVER_HOST}:${MO_SERVER_PORT}/getRequestsHistory/`);
    } catch(error) {
        console.error(error);
    }
}

export {
    getRequests
}