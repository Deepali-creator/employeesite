/* global request response */
'use strict';

// API
var ISML = require('dw/template/ISML');
var Transaction = require('dw/system/Transaction');
var Order = require('dw/order/Order');
var OrderMgr = require('dw/order/OrderMgr');
var issueLogger = require('dw/system/Logger').getLogger('Kount_issue','kount_issue_log');

// Tools
var kount = require('*/cartridge/scripts/kount/libKount');
var KountUtils = require('*/cartridge/scripts/kount/kountUtils');

/**
 * @description Handler for the Kount XML Event Notification System (ENS)
 */
function eventClassifications() {
    issueLogger.warn('\n Event Classification called \n' + request.httpParameterMap.getRequestBodyAsString()+'\n');
    kount_Executed(request.httpParameterMap.getRequestBodyAsString());
    if (!kount.validateIpAddress(request.httpRemoteAddress)) {
        response.setStatus(401);
        return;
    }
    if (kount.isENSEnabled()) {
        kount.queueENSEventsForProcessing(request.httpParameterMap.getRequestBodyAsString());
    }
    ISML.renderTemplate('kount/confirmationENS');
}

function kount_Executed(requestBody){
    var requestObj = KountUtils.parseEnsXMLtoObject(requestBody)
    var OrderNumber = requestObj[0].orderNo;
    var KountAttribute = requestObj[0].attributeName;
    issueLogger.warn("\n Executed for " +OrderNumber+"(KountAttribute:"+KountAttribute+")");
    try {
        Order = OrderMgr.getOrder(OrderNumber.toString());
        if(KountAttribute=='EDIT'){
            if(Order!=null){
                if(Order.custom.KountScriptExecuted !== undefined){
                    Transaction.wrap(function(){
                        Order.custom.KountScriptExecuted=true;
                    });
                }
            }
        }
    } catch (error) {
        issueLogger.warn("\n Error :" + JSON.stringify(error));
    }

    issueLogger.warn("\n Request Kount OBJECT \n" + JSON.stringify(requestObj));
    issueLogger.warn("\n Order:"+OrderNumber+".KountScriptExecuted : " + Order.custom.KountScriptExecuted);
}

/** @see module:controllers/K_ENS~EventClassifications */
exports.EventClassifications = eventClassifications;
exports.EventClassifications.public = true;
