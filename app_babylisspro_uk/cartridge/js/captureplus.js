'use strict';

var ajax = require('./ajax'),
	util = require('./util');

var $form=$('.address');
var addressFinder=$form.find('input[name$="_addressFinder"]');
var addressFinderCaption = addressFinder.parent().next('.form-caption');
var address1=$form.find('input[name$="_address1"]');
var address2=$form.find('input[name$="_address2"]');
var city=$form.find('input[name$="_city"]');
var state=$form.find('input[name$="_state"]');
var postal=$form.find('input[name$="_postal"]');
var country=$form.find('select[id$="_country"]');
var allFields=[address1,address2,city,state,postal,country];
var toggle=$form.find('input[name$="_toggleFields"]');
var toggleLabel = $form.find('label[for$="_toggleFields"]');
var containerLabel=/^(.+?)([\-|,] \d+ .+)$/;
var cachedData=null;

addressFinder.attr('placeholder', addressFinderCaption.text());
addressFinderCaption.hide();

function toggleFields(e){
	if(e.target.checked){
		allFields.forEach(function(f){
			f.attr("disabled",null);
		});
		addressFinder.closest(".form-row").hide();
		addressFinder.attr("disabled","disabled");
		toggleLabel.text($(toggle).attr("data-label-disable"));
	}else{
		allFields.forEach(function(f){
			f.attr("disabled","disabled");
		});
		addressFinder.closest(".form-row").show();
		addressFinder.attr("disabled",null);
		toggleLabel.text($(toggle).attr("data-label-enable"));
	}
}

exports.init = function () {
	toggle.attr({
		'data-label-enable': Resources.ENABLE,
		'data-label-disable': Resources.DISABLE
	});
	if(addressFinder.length>0){
		addressFinder.autocomplete({minLength:4, delay:300,
			source:function(req,res){
				if(null===cachedData){
					ajax.getJson({
						url: util.appendParamToURL(Urls.searchAddress,"query",$(addressFinder).val()),
						callback: function(data){
							res(data);
					}});
				}else{
					res(cachedData);
					cachedData=null;
				}
			},
			select: function(e,ui){
				if(containerLabel.test(ui.item.label)){
					var uival=ui.item.value;
					ajax.getJson({
						url: util.appendParamToURL(Urls.searchAddress,"id",ui.item.value),
						callback: function(data){
							if(0==data.length){
								ajax.getJson({
									url: util.appendParamToURL(Urls.retrieveAddress,"id",ui.item.value),
									callback: function(data){
										address1.val(data.address1);
										address2.val(data.address2);
										city.val(data.city);
										state.val(data.stateCode);
										postal.val(data.postalCode);
										country.val(data.countryCode);
									}
								});
							}else{
								cachedData=data;
								addressFinder.autocomplete("search");
							}
						}
					});
				}else{
					ajax.getJson({
						url: util.appendParamToURL(Urls.retrieveAddress,"id",ui.item.value),
						callback: function(data){
							address1.val(data.address1);
							address2.val(data.address2);
							city.val(data.city);
							state.val(data.stateCode);
							postal.val(data.postalCode);
							country.val(data.countryCode);
						}
					});
				}
				ui.item.value=ui.item.label;
			}
		});
		toggleFields({target:toggle.unwrap()[0]});
		toggle.on("change",toggleFields);
		$form.on("submit",function(){
			allFields.forEach(function(f){
				f.attr("disabled",null);
			});
		});
	}
}
