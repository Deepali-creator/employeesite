var BasketMgr = require('dw/order/BasketMgr');
var ISML = require('dw/template/ISML');
var Transaction = require('dw/system/Transaction');
var LocalServiceRegistry = require('dw/svc/LocalServiceRegistry');
var URLUtils = require('dw/web/URLUtils');
var Logger = require('dw/system/Logger');
var Site = require('dw/system/Site').current;

var ups = require('~/cartridge/scripts/lib/libUPS');

/**
 * runs AVS on the basket shipment address.
 * must have session.custom.ResumeFunction and session.custom.ReturnFunction set to know where to return in the checkout process.
 * @returns {Boolean} AVS returned one result and address object was updated; safe to resume from wherever.
 */
function verifyShipmentAddress(){
	if(empty(session.custom.ResumeFunction)){
		throw new Error("session.custom.ResumeFunction not set. There is no resume!");
	}
	if(empty(session.custom.ReturnFunction)){
		throw new Error("session.custom.ReturnFunction not set. There is no return!");
	}
	return verify(BasketMgr.currentBasket.defaultShipment.shippingAddress);
}

/**
 * runs AVS on the basket billing address.
 * must have session.custom.ResumeFunction and session.custom.ReturnFunction set to know where to return in the checkout process.
 * @returns {Boolean} AVS returned one result and address object was updated; safe to resume from wherever.
 */
function verifyBillingAddress(){
	if(empty(session.custom.ResumeFunction)){
		throw new Error("session.custom.ResumeFunction not set. There is no resume!");
	}
	if(empty(session.custom.ReturnFunction)){
		throw new Error("session.custom.ReturnFunction not set. There is no return!");
	}
	return verify(BasketMgr.currentBasket.billingAddress);
}

/**
 * runs the actual AVS on the given dw.order.OrderAddress, and displays a page to pick (if needed)
 * must have session.custom.ResumeFunction and session.custom.ReturnFunction set to know where to return in the checkout process.
 * @param address
 */
function verify(address){
	var upsservice = LocalServiceRegistry.createService("UPS.AVSL",{
		initServiceClient : function(service : SOAPService) : Object {
			var xav : WebReference2 = webreferences2.XAV;
			service.setAuthentication("NONE");
			return xav.getDefaultService();
		},
		createRequest: function(service : Service, params) : Object {
			var address=params;
			var xav : WebReference2 = webreferences2.XAV;
	
			var addressKey = new xav.AddressKeyFormatType();
			var addresses=addressKey.getAddressLine();
			addresses.add(address.address1);
			if(!empty(address.address2)){
				addresses.add(address.address2);
			}
			addressKey.setPoliticalDivision2(address.city);
			addressKey.setPoliticalDivision1(address.stateCode);
			addressKey.setCountryCode(address.countryCode.value.toLocaleUpperCase());
			if (null!=address.postalCode && address.postalCode.length===5){
				addressKey.setPostcodePrimaryLow(address.postalCode.substr(0,5));
			}
	
			var reqtype = new xav.RequestType();
			reqtype.getRequestOption().add("1");
	
			var request = new xav.XAVRequest();
			request.setRequest(reqtype);
			//request.setRegionalRequestIndicator("false");
			request.setAddressKeyFormat(addressKey);
			return request;
		},
		execute: function(service : SOAPService, request : Object) : Object {
			var xav : WebReference2 = webreferences2.XAV;
			var security = new xav.UPSSecurity();
			var token = new xav.UPSSecurity.UsernameToken();
			token.setUsername(service.configuration.credential.user);
			token.setPassword(service.configuration.credential.password);
			security.setUsernameToken(token);
			var accesstoken = new xav.UPSSecurity.ServiceAccessToken();
			accesstoken.setAccessLicenseNumber(Site.current.preferences.custom.UPSAVSlicense);
			security.setServiceAccessToken(accesstoken);
			return service.serviceClient.processXAV(request, security);
		},
		parseResponse: function(service : Service, response : Object) : Object {
			var options : Array = new Array();
			for each (var candidate in response.candidate){
				var incoming = candidate.getAddressKeyFormat();
				var addressLine = incoming.getAddressLine();
				if (!empty(addressLine) && !(addressLine instanceof String)){
					addressLine = incoming.getAddressLine()[0]
				}
				var address = {	address1 : addressLine,
								address2 : null,
								city : incoming.getPoliticalDivision2(),
								stateCode : incoming.getPoliticalDivision1(),
								postalCode : incoming.getPostcodePrimaryLow(),
								countryCode : incoming.getCountryCode()};
				options.push(address);
				if (options.length==8){
					break;
				}
			}
			return options;
		},
		getRequestLogMessage: function(request : Object) : String {
			return request;
		},
		getResponseLogMessage: function(response : Object) : String {
			return response.text;
		}
	});
	var result = upsservice.call(address);
	var activeUPSValidation = Site.getCustomPreferenceValue('activeUPSValidation');
	if(result.ok){
		if(activeUPSValidation){
			if(1===result.object.length && (address.address1 == result.object[0].address1 && address.city == result.object[0].city && address.stateCode == result.object[0].stateCode && address.postalCode == result.object[0].postalCode)) {
				Transaction.wrap(function(){
					address.address1=result.object[0].address1;
					address.city=result.object[0].city;
					address.stateCode=result.object[0].stateCode;
					address.postalCode=result.object[0].postalCode;
					address.setCountryCode(result.object[0].countryCode);
				});
				var res=session.custom.ResumeFunction.split("-");
				require(res[0])[res[1]]();
			}else{
				var upsform=session.forms.upsform;
				upsform.addresslist.copyFrom(result.object);
				ISML.renderTemplate("address.isml",{
					ContinueURL: URLUtils.https('UPS-Choose'),
					Basket: BasketMgr.currentBasket,
					upsform: upsform});
			}

		}
		else {
			var upsform=session.forms.upsform;
			upsform.addresslist.copyFrom(result.object);
			ISML.renderTemplate("address.isml",{
				ContinueURL: URLUtils.https('UPS-Choose'),
				Basket: BasketMgr.currentBasket,
				upsform: upsform});
		}
	}else{
		// AVS unavailable, assume address is OK, because there's no way to tell otherwise
		var res=session.custom.ResumeFunction.split("-");
		require(res[0])[res[1]]();
	}
}

function choose(){
	var upsform=session.forms.upsform;
    var handlers={
        'useoriginal':function(){
        	// leave things the same
			var res=session.custom.ResumeFunction.split("-");
			require(res[0])[res[1]]();
        },'select':function(){
        	var address=BasketMgr.currentBasket.defaultShipment.shippingAddress;
        	var result=request.triggeredFormAction;
        	Transaction.wrap(function(){
				address.address1=result.object.address1;
				address.city=result.object.city;
				address.stateCode=result.object.stateCode;
				address.postalCode=result.object.postalCode;
				address.setCountryCode(result.object.countryCode);
        	});
			var res=session.custom.ResumeFunction.split("-");
			require(res[0])[res[1]]();
        }
    };
    if(!empty(handlers[request.triggeredFormAction.formId])){
    	handlers[request.triggeredFormAction.formId].apply(handlers);
    }else{
		var ret=session.custom.ReturnFunction.split("-");
		require(ret[0])[ret[1]]();
    }
}


/**
 * UPS-GetCostMap
 * 
 * Returns a HashMap of shipping method costs for the UPS methods, based on address and basket weight.
 * A cached copy of the cost map is stored in session, and used when the basket address and weight matches what is stored
 * to prevent unnecessary API calls to UPS.
 * 
 * @returns UPSCostMap : dw.util.HashMap 
 */
function getCostMap() {
	var basket = BasketMgr.getCurrentBasket();
	var costMap = null;
	try{
		if(basket && !empty(basket.shipments[0].shippingMethod) && !empty(basket.shipments[0].shippingMethod.custom.upsServiceCode)) {
			//if a cached map can be pulled from the session, grab it and return
			var retrieveResult = ups.RetrieveCostMap(basket);
			if(!retrieveResult.UPSError && !empty(retrieveResult.UPScosts)) {
				costMap = retrieveResult.UPScosts;			
			} else {
				//nothing saved to session, or there was an error, so call UPS for fresh rates
				var calculateResult = ups.CalculateUPSCosts(basket);
				
				if(!calculateResult.UPSError && calculateResult.costMap != null) {
					costMap = calculateResult.costMap;
					
					//save the cost map to session cache before we return it
					ups.SaveCostMap(basket, costMap);
				}
			}
		}
	}catch(ex){
		Logger.error(ex);
	}
	
	return {'UPSCostMap': costMap};
}

//exports.VerifyShipmentAddress=guard.ensure(['https'], verifyShipmentAddress);
//exports.Choose=guard.ensure(['https','post'], choose);

exports.GetCostMap = getCostMap;