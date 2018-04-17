"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var axios_1 = require("axios");
var api = axios_1.default.create({
    baseURL: process.env.REACT_APP_CHATBOT_API_BASE_URL
});
exports.getActions = function () {
    var uri = '/api/v1/webPersistentOptions?chatbot=' + process.env.REACT_APP_CID;
    return api.get(uri);
};
exports.giveFeedback = function (payload) {
    var uri = '/api/v1/webFeedback?chatbot=' + process.env.REACT_APP_CID + '&' +
        'type=' + payload.type + '&' +
        'uid=' + payload.uid + '&' +
        'action=' + payload.action + '&' +
        'question=' + payload.question;
    return api.post(uri);
};
exports.getToken = function () {
    var uri = '/api/v1/webGetToken?chatbot=' + process.env.REACT_APP_CID;
    return api.get(uri);
};
//# sourceMappingURL=api.js.map