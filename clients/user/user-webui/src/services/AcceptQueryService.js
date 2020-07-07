import {MO_SERVER_HOST, MO_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function acceptQuery(userId, queryId) {
    try {
        return axios.get(`http://${MO_SERVER_HOST}:${MO_SERVER_PORT}/acceptQuery/` + userId + `/` + queryId + `/`);
    } catch(error) {
        console.error(error);
    }
}
export {
    acceptQuery
}