/**
*   check status script
*

*   @input KountOrderStatus : String
*
*/

/**
 * @param {Object} args - pdict of the execution
 * @returns {number} - returns execution result
 */
function execute(args) {
    if (!empty(args.KountOrderStatus) && args.KountOrderStatus === 'DECLINED') {
        return PIPELET_ERROR;
    }

    return PIPELET_NEXT;
}
