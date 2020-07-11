import {USER_SERVER_HOST, USER_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function acceptQuery(userId, queryId) {
    try {
        return axios.post(`http://${USER_SERVER_HOST}:${USER_SERVER_PORT}/acceptQuery/`); // + userId + `/` + queryId + `/`
    } catch(error) {
        console.error(error);
    }
}
export {
    acceptQuery
}