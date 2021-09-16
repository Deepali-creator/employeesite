/**
*   preris script
*
*   @input Basket : Object
*/

// Kount
var Kount = require('*/cartridge/scripts/kount/libKount');

/**
 * @param {Object} args - pdict of the execution
 * @returns {number} - returns execution result
 */
function execute(args) {
    var call = Kount.preRiskCall(args.Basket, false);

    if (call && call.KountOrderStatus === 'DECLINED') {
        return PIPELET_ERROR;
    }

    return PIPELET_NEXT;
}
