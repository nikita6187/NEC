import {USER_SERVER_HOST, USER_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getQueryData() {
    try {
        return axios.get(`http://${USER_SERVER_HOST}:${USER_SERVER_PORT}/getQueryData/`);
    } catch(error) {
        console.error(error);
    }
}
export {
    getQueryData
}