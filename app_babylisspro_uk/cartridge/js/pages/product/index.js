'use strict';

var dialog = require('../../dialog'),
	productStoreInventory = require('../../storeinventory/product'),
	tooltip = require('../../tooltip'),
	util = require('../../util'),
	addToCart = require('./addToCart'),
	availability = require('./availability'),
	image = require('./image'),
	productNav = require('./productNav'),
	productSet = require('./productSet'),
	recommendations = require('./recommendations'),
	TPromise = require('promise'),
	sendToFriend = require('../../send-to-friend'),
	variant = require('./variant');

/**
 * @description Initialize product detail page with reviews, recommendation and product navigation.
 */
function initializeDom() {
	$('#pdpMain .product-detail .product-tabs').tabs({heightStyle: "auto"});
	$('#pdpMain .product-detail .product-tabs-mobile').tabs({heightStyle: "auto"});
	productNav();
	recommendations();
	tooltip.init();
}

/**
 * @description Initialize event handlers on product detail page
 */
function initializeEvents() {
	var $pdpMain = $('#pdpMain');

	addToCart();
	availability();
	variant();
	image();
	productSet();
	sendToFriend.initializeDialog($pdpMain);
	if (SitePreferences.STORE_PICKUP) {
		productStoreInventory.init();
	}

	// Add to Wishlist and Add to Gift Registry links behaviors
	$pdpMain.on('click', '[data-action="wishlist"], [data-action="gift-registry"]', function () {
		var data = util.getQueryStringParams($('.pdpForm').serialize());
		if (data.cartAction) {
			delete data.cartAction;
		}
		var url = util.appendParamsToUrl(this.href, data);
		this.setAttribute('href', url);
	});

	// product options
	$pdpMain.on('change', '.product-options select', function () {
		var salesPrice = $pdpMain.find('.product-add-to-cart .price-sales');
		var selectedItem = $(this).children().filter(':selected').first();
		salesPrice.text(selectedItem.data('combined'));
	});

	// prevent default behavior of thumbnail link and add this Button
	$pdpMain.on('click', '.thumbnail-link, .unselectable a', function (e) {
		e.preventDefault();
	});

	$('.size-chart-link a').on('click', function (e) {
		e.preventDefault();
		dialog.open({
			url: $(e.target).attr('href')
		});
	});
	$('#submit-notification').on('click',function(e){
		e.preventDefault();
		var jqt=$(this);
		var email=jqt.parent().find('#notify-email').val();
		if(!/.+?@.+?\..+/.test(email)){
			if(this.checkValidity){
				this.checkValidity();
			}
			return false;
		}
		var product=jqt.parent().find('#product').val();
		TPromise.resolve($.ajax({
			type: 'POST',
			url: jqt.data('action')+'?email='+email+'&product='+product
		})).then(function(r){
			$('.notify-submit-fields').hide();
			$('.notify-response').show();
		},function(r){
			alert("Unable to add you to the notification list.");
		});
	});
	
	
	// View full description
	$pdpMain.on('click', '.view-desc-link', function (e) {
		e.preventDefault();
		$('#pdpMain .product-detail .product-tabs').tabs({active: 1, heightStyle: "auto"});
		$('#pdpMain .product-detail .product-tabs-mobile').tabs({active: 1, heightStyle: "auto"});
		$("html, body").animate({scrollTop:$('#tab1').offset().top}, 850);
		
		return false;

	});
	
	$('.pt_product-details').on('click', '.ui-tabs-anchor', function(){
		var pos = $('.info-tabs').offset();
		var scrollPos = pos.top;
		util.scrollBrowser(pos.top);
	});


}

var product = {
	initializeEvents: initializeEvents,
	init: function () {
		initializeDom();
		initializeEvents();
	}
};

module.exports = product;
