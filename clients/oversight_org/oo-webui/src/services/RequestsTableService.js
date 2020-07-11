import {OO_SERVER_HOST,OO_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getRequests() {
    try {
        return axios.get(`http://${OO_SERVER_HOST}:${OO_SERVER_PORT}/getRequestsHistory/`);
    } catch(error) {
        console.error(error);
    }
}
export {
    getRequests
}