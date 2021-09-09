'use strict';

/*
 * API includes
 */
var Status = require('dw/system/Status');

exports.onRequest = function () {
    // var ShieldSquare = require('*/cartridge/controllers/ShieldSquare.js');
    var Site = require('dw/system/Site').getCurrent();
    // if (Site.getCustomPreferenceValue('enableshieldsquare')) {
    //     ShieldSquare.buildRequest();
    // }
    return new Status(Status.OK);
};
