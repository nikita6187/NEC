import {DC_SERVER_HOST,DC_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getRequests() {
    try {
        return axios.get(`http://${DC_SERVER_HOST}:${DC_SERVER_PORT}/getRequestsHistory/`);
    } catch(error) {
        console.error(error);
    }
}
export {
    getRequests
}