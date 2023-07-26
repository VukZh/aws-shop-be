"use strict";
exports.__esModule = true;
exports.buildResponse = void 0;
const buildResponse = function (statusCode, body) { return ({
    statusCode: statusCode,
    headers: {
        "Access-Control-Allow-Credentials": true,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "*"
    },
    body: JSON.stringify(body)
}); };
exports.buildResponse = buildResponse;
