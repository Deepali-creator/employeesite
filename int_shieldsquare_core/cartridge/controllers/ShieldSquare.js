'use strict';

var Site = require('dw/system/Site').getCurrent();
var ssLogger = require('dw/system/Logger').getLogger('ShieldSquare', 'shieldsquare');
var shieldSquareAdvanceConfig = JSON.parse(Site.getCustomPreferenceValue('shieldSquareAdvanceConfig')).data;

/**
 * This function is sending request to Shied Square server on every page load.
 * This function will check if current user request is authenticated or not using Shield Square server API
 **/
function buildRequest() {
    var ShieldSquareHelper = require('*/cartridge/scripts/lib/shieldSquareHelper.js');
    var skipurlFilter = ShieldSquareHelper.skipurlfilter(),
        extensionFilter = ShieldSquareHelper.extensionfilter();

    // skip request if any of below filter is true
    if (skipurlFilter || extensionFilter) {
        ssLogger.info('Sheildsquare request has been skip because of this reason: Requestfilter/Skipurl matched. Skipping Request');
        return;
    }
    var requestObj = ShieldSquareHelper.buildRequestObject(),
        configServiceReq = require('*/cartridge/scripts/services/shieldSquareService').getSQServices(),
        configServiceObj = configServiceReq.shieldSquareRequest();

    var result = configServiceObj.call(requestObj);
    if (result.status == 'OK') {
        var parseResult = JSON.parse(result.object);
        if (parseResult.ssresp == 0) {
            // Store the response
            ssLogger.info('Sheildsquare Success Response: {0}', result.object);
        } else if (parseResult.ssresp == 2 || parseResult.ssresp == 3) {
            ssLogger.info('Sheildsquare invalid Response: {0}', result.object);
            // eslint-disable-next-line no-underscore-dangle
            var sceme = shieldSquareAdvanceConfig._api_server_ssl_enabled == 'True' ? 'https://' : 'http://',
                queryString = ShieldSquareHelper.generateRedirectUrl(parseResult.ssresp),
                redirectURL = sceme + shieldSquareAdvanceConfig._redirect_domain + queryString; // eslint-disable-line no-underscore-dangle
            response.redirect(redirectURL);
        }
    } else {
        ssLogger.error('Sheildsquare error Response: {0}', result.object);
    }
}

exports.buildRequest = buildRequest;
