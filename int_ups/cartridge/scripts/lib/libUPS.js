'use strict';

var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var Order = require('dw/order');
var Util = require('dw/util');
var Logger = require('dw/system/Logger').getLogger('UPS', '');
var Site = require('dw/system/Site').current;
var UPSUtils = require('~/cartridge/scripts/lib/UPSUtils');
var StringUtils = require('dw/util/StringUtils');


/**
* 	RetrieveCostMap()
*
*		Try to pull the cached UPS cost map out of the session.
*		In order for the prices to be accurate, the address and weight must match the current state of the basket.
*/
exports.RetrieveCostMap = function(basket) {
	try {
		if(empty(basket)) {
			throw new Error('Basket is empty!');
		}
		
		if(empty(basket.shipments[0].shippingAddress)) {
			throw new Error("Basket Shipping address is empty, skippping.");
		}
		
		var cache = session.custom.UPSCache;
		if(empty(cache)) {
			Logger.debug('[RetrieveCostMap()] Session cache is empty, skipping.');
			return {'UPSError': false};
		}
		
		//Pull the address and weight out of the cache string
		var splitCache = cache.split(";");
		if(splitCache.length != 2) {
			throw new Error('Could not parse UPSCache, splitCache length is: ' + splitCache.length);
		}
		
		var contextStr = splitCache[0];
		Logger.debug('[RetrieveCostMap()] Context String: ' + contextStr);
		
		var contextArr = contextStr.split(':');
		if(contextArr.length != 4) {
			throw new Error('Could not parse UPSCache context, contextArr length is: ' + contextArr.length);
		}
		
		var postalCode = contextArr[0];
		var stateCode = contextArr[1];
		var countryCode = contextArr[2];
		var weight = contextArr[3];
		Logger.debug('[RetrieveCostMap()] Values from the cache:\n{0}\n{1}\n{2}\n{3}\n', postalCode, stateCode, countryCode, weight);
		
		var shippingAddress = basket.shipments[0].shippingAddress;
		var basketPostalCode = !empty(shippingAddress.postalCode) ? shippingAddress.postalCode : '';
		var basketStateCode = !empty(shippingAddress.stateCode) ? shippingAddress.stateCode : '';
		var basketCountryCode = !empty(shippingAddress.countryCode) ? shippingAddress.countryCode.value : '';
		var basketWeight = UPSUtils.GetShipmentWeight(basket).toString();
		Logger.debug('[RetrieveCostMap()] Values from the basket:\n{0}\n{1}\n{2}\n{3}\n', basketPostalCode, basketStateCode, basketCountryCode, basketWeight);

		//if the cached values match the basket values, then we can build the cost map from the session cache
		if(postalCode == basketPostalCode && stateCode == basketStateCode && countryCode == basketCountryCode && weight == basketWeight) {
			var map = {};
			Logger.debug('[RetrieveCostMap()] UPS Cache is valid, retrieving cost map.');
			
			var mapStr = splitCache[1];
			var splitMap = mapStr.split('|');
			
			for each(let service in splitMap) {
				let splitService = service.split(':');
				if(splitService.length != 2) {
					Logger.debug('[RetrieveCostMap()] Problem splitting service and cost: {0}, skipping.');
					continue;
				}
				map[splitService[0]]=splitService[1];
			}
			return {'UPScosts': map, 'UPSError': false}
		}
	} catch(e) {
		Logger.error('[RetrieveCostmap()] Exception caught: ' + e.message);
	}
	return {'UPSError': true};
};



/**
 * 	CalculateUPSCosts()
 * 
 * 		Calls an HTTP rates service to get a map of shipping costs based on address and basket weight.
 */
exports.CalculateUPSCosts = function(basket) {
	var upscosts = null;
	
	try {
		if(empty(basket)) {
			throw new Error('Basket is empty!');
		}
		
		let shipment = basket.shipments[0];
		let shippingAddress = !empty(shipment) ? shipment.shippingAddress : null;
		
		if(empty(shipment.shippingAddress) || empty(shipment.shippingAddress.postalCode) || empty(shipment.shippingAddress.countryCode)) {
			throw new Error('No shipping address in the basket, skipping UPS call.');
		}
		
		upscosts = {};
		
		var shippingweight = UPSUtils.GetShipmentWeight(basket);

		let service = LocalServiceRegistry.createService('UPS.HTTP.' + Site.ID,{
			createRequest: function(service, upsObj) {
				service.client.setRequestHeader('Content-type', 'text/xml');
				service.setAuthentication('NONE');
				
				return (<?xml version="1.0"?>
					<AccessRequest xml:lang="en-US">
						<AccessLicenseNumber>{service.configuration.credential.custom.key}</AccessLicenseNumber>
						<UserId>{service.configuration.credential.user}</UserId>
						<Password>{service.configuration.credential.password}</Password>
					</AccessRequest>).toString()+"\n" + (<?xml version="1.0"?>
					<RatingServiceSelectionRequest xml:lang="en-US">
						<Request>
							<TransactionReference>
								<CustomerContext>Rating and Service</CustomerContext>
								<XpciVersion>1.0</XpciVersion>
							</TransactionReference>
							<RequestAction>Rate</RequestAction>
							<RequestOption>Shop</RequestOption>
						</Request>
						<PickupType>
							<Code>{upsObj.pickupCode}</Code>
						</PickupType>
						<Shipment>
							<Description>Rate Description</Description>
							<Shipper>
								<Name>{upsObj.shipperName}</Name>
								<ShipperNumber>{upsObj.shipperNumber}</ShipperNumber>
								<Address>
									<AddressLine1>{upsObj.shipperAddress}</AddressLine1>
									<City>{upsObj.shipperCity}</City>
									<StateProvinceCode>{upsObj.shipperStateCode}</StateProvinceCode>
									<PostalCode>{upsObj.shipperPostalCode}</PostalCode>
									<CountryCode>{upsObj.shipperCountryCode}</CountryCode>
								</Address>
							</Shipper>
							<ShipTo>
								<PhoneNumber>{upsObj.shipToPhone}</PhoneNumber>
								<Address>
									<AddressLine1>{upsObj.shipToAddress}</AddressLine1>
									<City>{upsObj.shipToCity}</City>
									<PostalCode>{upsObj.shipToPostalCode}</PostalCode>
									<StateProvinceCode>{upsObj.shipToStateCode}</StateProvinceCode>
									<CountryCode>{upsObj.shipToCountryCode}</CountryCode>
									<ResidentialAddressIndicator/>
								</Address>
							</ShipTo>
							<ShipFrom>
								<CompanyName>{upsObj.shipFromName}</CompanyName>
								<PhoneNumber>{upsObj.shipFromPhone}</PhoneNumber>
								<Address>
									<AddressLine1>{upsObj.shipFromAddress}</AddressLine1>
									<City>{upsObj.shipFromCity}</City>
									<PostalCode>{upsObj.shipFromPostalCode}</PostalCode>
									<StateProvinceCode>{upsObj.shipFromStateCode}</StateProvinceCode>
									<CountryCode>{upsObj.shipFromCountryCode}</CountryCode>
								</Address>
							</ShipFrom>
							<PaymentInformation>
								<Prepaid>
									<BillShipper>
										<AccountNumber>Ship Number</AccountNumber>
									</BillShipper>
								</Prepaid>
							</PaymentInformation>
							<Package>
								<PackagingType>
									<Code>{upsObj.packageCode}</Code>
								</PackagingType>
								<Description>Rate</Description>
								<PackageWeight>
									<UnitOfMeasurement>
										<Code>{upsObj.packageWeightUnit}</Code>
									</UnitOfMeasurement>
									<Weight>{upsObj.packageWeight}</Weight>
								</PackageWeight>
							</Package>
							<RateInformation>
								<NegotiatedRatesIndicator>Bids or Account Based Rates</NegotiatedRatesIndicator>
							</RateInformation>
						</Shipment>
					</RatingServiceSelectionRequest>).toString();
			},
			parseResponse: function(service, client) {
				return new XML(client.getText());
			},
			mockCall: function(service, client){
			    return {
					statusCode: 200,
					statusMessage: "Success",
					text: "MOCK RESPONSE (" + service.URL + ")"
				};
			}
		});
		var result = service.call({
			'accessKey': service.configuration.credential.custom.key,
			'enableNegotiatedRates': "true",
			'pickupCode': shipment.shippingMethod.custom.upsPickupCode,
			'shipperName': shipment.shippingMethod.custom.upsShipperName,
			'shipperAddress': shipment.shippingMethod.custom.upsShipperAddress,
			'shipperCountryCode': shipment.shippingMethod.custom.upsShipperCountryCode,
			'shipperCity': shipment.shippingMethod.custom.upsShipperCity,
			'shipperPhone': shipment.shippingMethod.custom.upsShipperPhone,
			'shipperPostalCode': shipment.shippingMethod.custom.upsShipperPostalCode,
			'shipperStateCode': shipment.shippingMethod.custom.upsShipperStateCode,
			'shipperNumber': shipment.shippingMethod.custom.upsShipperNumber,
			'shipToPhone': shippingAddress.phone || '',
			'shipToAddress': shippingAddress.address1 || '',
			'shipToCity': shippingAddress.city || '',
			'shipToPostalCode': shippingAddress.postalCode,
			'shipToStateCode': shippingAddress.stateCode || '',
			'shipToCountryCode': shippingAddress.countryCode,
			'shipFromName': shipment.shippingMethod.custom.upsShipFromName,
			'shipFromAddress': shipment.shippingMethod.custom.upsShipFromAddress,
			'shipFromCountryCode': shipment.shippingMethod.custom.upsShipFromCountryCode,
			'shipFromCity': shipment.shippingMethod.custom.upsShipFromCity,
			'shipFromPhone': shipment.shippingMethod.custom.upsShipFromPhone,
			'shipFromPostalCode': shipment.shippingMethod.custom.upsShipFromPostalCode,
			'shipFromStateCode': shipment.shippingMethod.custom.upsShipFromStateCode,
			'serviceCode': shipment.shippingMethod.custom.upsServiceCode,
			'packageCode': shipment.shippingMethod.custom.upsPackageCode,
			'packageWeightUnit': "LBS",
			'packageWeight':  shippingweight.toString()
		});
		if(result.ok) {
			let xmlResponse = result.object;
			if( xmlResponse.RatedShipment.length() > 0 ) {
				for(let i = 0; i < xmlResponse.RatedShipment.length(); i++) {
					let ratedShipment = xmlResponse.RatedShipment[i];
					var serviceCode = new String(ratedShipment.Service.Code);
					let totalCost = new Number(ratedShipment.TotalCharges.MonetaryValue);
					try{
						totalCost = new Number(ratedShipment.NegotiatedRates.NetSummaryCharges.GrandTotal.MonetaryValue);
					}catch(ex){}
					upscosts[serviceCode]=totalCost;
				}
			} else if(xmlResponse.Response.Error.length() > 0) {
				throw new Error('Rating Service returned an error:\nCode: ' + xmlResponse.Response.Error.ErrorCode + '\nSeverity: ' + xmlResponse.Response.Error.ErrorSeverity + '\nDescription: ' + xmlResponse.Response.Error.ErrorDescription + '\n');
			} else {
				throw new Error('Rating Service did not return rates or error messages....');
			}
		} else {
			throw new Error('result not ok.\nerror: {0}\nmsg: {1} ', result.error, result.errorMessage);
		}
		return {'UPSError': false, 'costMap': upscosts};
	} catch(e) {
		var i = e.toString();
		Logger.error('[CalculateUPSCosts()] Exception caught: ' + e.message);
		return {'UPSError': true, 'costMap': upscosts};
	}
};


/**
*	SaveCostMap()
*
*		Serialize the current cost hashmap from UPS and save it in the session.
*		
*		In order for the saved cost map to be validated and current, it must have the context of:
*			1. Address: postal, state, and country code
*			2. Weight: total lbs of basket
*
*		We will store this information in a serialized string with the format:
*			<postal>:<state>:<country>:<weight>;<service1>:<cost1>|<service2>:<cost2>|<serviceN>:<costN>
*
*		Before calling the UPS API again, we can test the address and weight to see if the API call is needed.
*/
exports.SaveCostMap = function(basket, costMap) {
	try {
		if(empty(basket)) {
			throw new Error('Basket is empty!');
		}
		
		if(empty(costMap)) {
			throw new Error('Cost Map is empty, not saving it to session.');
		}
		
		if( basket.shipments[0].shippingAddress != null) {
			let postalCode = !empty(basket.shipments[0].shippingAddress.postalCode) ? basket.shipments[0].shippingAddress.postalCode : "";
			let stateCode = !empty(basket.shipments[0].shippingAddress.stateCode) ? basket.shipments[0].shippingAddress.stateCode : "";
			let countryCode = !empty(basket.shipments[0].shippingAddress.countryCode) ? basket.shipments[0].shippingAddress.countryCode : "";
			let weight = UPSUtils.GetShipmentWeight(basket).toString();
			let contextStr = postalCode + ":" + stateCode + ":" + countryCode + ":" + weight;
			
			let costMapStr = '';
			let costMapArr = new Array();
			var keys = Object.keys(costMap).toString().split(",");
			for(let i = 0; i < keys.length; i++) {
				let k = keys[i];
				costMapArr.push(k + ":" + costMap[k]);
			}
			costMapStr = costMapArr.join("|");
			
			session.custom.UPSCache = contextStr + ";" + costMapStr;
			Logger.debug("[SaveCostMap()] Saved UPS cost map string: " + session.custom.UPSCache);
		} else {
			throw new Error("Shipping address not in basket, not saving the UPS cost map to session.");
		}
	} catch(e) {
		Logger.error('[SaveCostMap()] Exception caught: ' + e.message);
		return {'UPSError': true};
	}
};


function mergeCostMaps (receiver,tobemerged,factor) {
	var mergedmap = new Util.HashMap();
    var receiverkeys = receiver.keySet();
	for(var j = 0; j < receiverkeys.size(); j++) {
		var key = receiverkeys[j];
		var receivercost = receiver.get(key);
		var tobecost = tobemerged.get(key);
		if (receivercost && tobecost) {
			mergedmap.put(key,new Number(receivercost + factor*tobecost));
		}
	}
	return mergedmap;
}
