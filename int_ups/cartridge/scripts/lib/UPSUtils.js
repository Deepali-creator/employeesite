'use strict';

var Order = require('dw/order');
var Logger = require('dw/system/Logger').getLogger('UPS', '');

exports.GetShipmentWeight = function(basket) {
	var totalWeight = 0;
	
	if(!empty(basket) && !empty(basket.shipments[0])) {
		let plis = basket.shipments[0].productLineItems;
		let numLines = plis.length;
		
		for(let i = 0; i < numLines; i++) {
			let pli = plis[i];
			let prod = pli.getProduct();
			if(!empty(prod)) {
				let weightStr = prod.custom.dimWeight || basket.shipments[0].shippingMethod.custom.upsDefaultWeight;
				let qtyWeight = 0;
				let qty = pli.getQuantityValue() || 1;
				
				//remove any characters other than numbers and decimal point
				let weight = new Number(weightStr.replace(/[^0-9\.]/g, ''));
				qtyWeight = qty * weight;
				
				totalWeight += qtyWeight;
			}
		}
	}
	
	if(totalWeight < 1) {
		totalWeight = 1;
	}
	
	Logger.debug('[GetShipmentWeight()] Calculated weight: ' + totalWeight);
	return totalWeight;
}
