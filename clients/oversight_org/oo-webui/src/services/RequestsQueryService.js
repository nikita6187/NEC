import {OO_SERVER_HOST,OO_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getQueries() {
    try {
        return axios.get(`http://${OO_SERVER_HOST}:${OO_SERVER_PORT}/getAllQueries`);
    } catch(error) {
        console.error(error);
    }
}
export {
    getQueries
}