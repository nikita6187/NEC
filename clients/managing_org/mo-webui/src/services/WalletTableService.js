import {MO_SERVER_HOST, MO_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function getQueries() {
    try {
        return axios.get(`http://${MO_SERVER_HOST}:${MO_SERVER_PORT}/getAllWallets`);
    } catch(error) {
        console.error(error);
    }
}

export {
    getQueries
}