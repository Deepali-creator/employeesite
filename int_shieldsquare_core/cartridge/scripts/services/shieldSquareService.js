/**
 *
 * Initialize HTTP service for Shield Sqaure
 *
 */
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');

var shieldSquareServices = {
    /**
     * To udpate the JSON config from SQ server
     * @returns {Object}
     **/
    updateConfig: function () {
        var SSConfig = LocalServiceRegistry.createService('ShieldSquareConfig', {
            createRequest: function (service, params) {
                var bearerToken = 'Bearer ' + params.apiKey;

                service.URL = service.URL + params.environmentNum + '/configuration';
                service.addHeader('Authorization', bearerToken);
                service.setRequestMethod('GET');
            },
            parseResponse: function (service, listOutput) {
                return listOutput.text;
            },
            filterLogMessage: function (message) {
                return message;
            },
            getRequestLogMessage: function (serviceRequest) {
                return serviceRequest;
            },
            getResponseLogMessage: function (serviceResponse) {
                return serviceResponse;
            }
        });
        return SSConfig;
    },
    /**
     * ShieldSqare Server request on every page refresh
     * @returns {Object}
     **/
    shieldSquareRequest: function () {
        var SSConfig = LocalServiceRegistry.createService('ShieldSquareServerRequest', {
            createRequest: function (service, params) {
                service.addHeader('Content-Type', 'application/json');
                service.setRequestMethod('POST');
                return JSON.stringify(params);
            },
            parseResponse: function (service, listOutput) {
                return listOutput.text;
            },
            filterLogMessage: function (message) {
                return message;
            },
            getRequestLogMessage: function (serviceRequest) {
                return serviceRequest;
            },
            getResponseLogMessage: function (serviceResponse) {
                return serviceResponse;
            }
        });
        return SSConfig;
    }
};
/**
 * Helper method to export the helper
 * @returns {Object}
 **/
function getSQServices() {
    return shieldSquareServices;
}

module.exports = {
    getSQServices: getSQServices
};
