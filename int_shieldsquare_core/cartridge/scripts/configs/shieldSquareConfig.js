/* eslint-disable no-underscore-dangle */
/*
 *  This function is used to update JSON configuration from shield Square server
 */
var Site = require('dw/system/Site').getCurrent();

/**
 * Execute the config
 */
function execute() {
    var shieldSquareConfig = JSON.parse(Site.getCustomPreferenceValue('shieldSquareConfig')),
        configServiceReq = require('*/cartridge/scripts/services/shieldSquareService').getSQServices(),
        configServiceObj = configServiceReq.updateConfig(),
        environmentNum = shieldSquareConfig.deployment_number,
        apiKey = shieldSquareConfig.key;

    var reqObj = {
        'environmentNum': environmentNum,
        'apiKey': apiKey
    };

    var result = configServiceObj.call(reqObj);
    if (result.status == 'OK') {
        var res = JSON.parse(result.object),
            currentConfig = shieldSquareConfig;
        currentConfig.api_server_timeout = res.data._api_server_timeout;
        currentConfig.api_server_ssl_enabled = res.data._api_server_ssl_enabled;
        currentConfig._file_write_location = res.data._file_write_location;
        currentConfig.api_server_domain = res.data._api_server_domain;
        currentConfig._api_server_ttl = res.data._api_server_ttl;

        Site.setCustomPreferenceValue('shieldSquareConfig', JSON.stringify(currentConfig));
        Site.setCustomPreferenceValue('shieldSquareAdvanceConfig', result.object);

        var ssLogger = require('dw/system/Logger').getLogger('ShieldSquare', 'shieldsquare');
        ssLogger.info('Sheildsquare Config Request : {0}, Sheildsquare Config Response : {1}', JSON.stringify(reqObj), result.object);
    }
}

/* Exports of the controller */

// Update Shield Square configuration
exports.execute = execute;
