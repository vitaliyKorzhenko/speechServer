const prodBaseUrl = "http://134.209.72.176:4003";

const testBaseUrl = "http://127.0.0.1:4003";


const prodInfoUrl = "http://134.209.72.176:4004";

const testInfoUrl = "http://127.0.0.1:4004";s

s
const prodMode = true;


function getBaseUrl () {
    return baseUrl = prodMode ? prodBaseUrl : testBaseUrl;
}

function getInfoUrl () {
    return baseUrl = prodMode ? prodInfoUrl : testInfoUrl;
}

const prodBaseUrlUA = "http://134.209.72.176:4011";

const testBaseUrlUA = "http://127.0.0.1:4011";

function getBaseUrlBotUA () {
    return prodMode ? prodBaseUrlUA : testBaseUrlUA;
}

const prodGovorikaUrl = "http://127.0.0.1:4001";

const devGovorikaUrl = "http://127.0.0.1:4001";



function getUrlGovorikaBot () {
    return prodMode ? prodGovorikaUrl : devGovorikaUrl;
}

module.exports = {
    getBaseUrl: getBaseUrl,
    getInfoUrl: getInfoUrl,
    getBaseUrlBotUA: getBaseUrlBotUA,
    getUrlGovorikaBot: getUrlGovorikaBot
}