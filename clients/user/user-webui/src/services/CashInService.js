import {MO_SERVER_HOST, MO_SERVER_PORT} from "./ConfigService";

const axios = require('axios').default;

function cashIn(userId, rId) {
    try {
        return axios.get(`http://${MO_SERVER_HOST}:${MO_SERVER_PORT}/cashinCoins/` + userId + `/` + rId + `/`);
    } catch(error) {
        console.error(error);
    }
}
export {
    cashIn
}