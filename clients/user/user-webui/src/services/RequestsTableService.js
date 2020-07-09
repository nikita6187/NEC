import {USER_SERVER_HOST,USER_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getRequests() {
    try {
        return axios.get(`http://${USER_SERVER_HOST}:${USER_SERVER_PORT}/getRequestsHistory/`);
    } catch(error) {
        console.error(error);
    }
}
export {
    getRequests
}