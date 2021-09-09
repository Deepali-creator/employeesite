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
	variant = require('./variant'),
	progress = require('../../progress'),
	recipe = require('../recipe');

/**
 * @description Initialize product detail page with reviews, recommendation and product navigation.
 */
function initializeDom() {
	$('#pdpMain .product-detail .product-tabs').tabs();
	productNav();
	recommendations();
	tooltip.init();
}

/**
 * @description Initialize event handlers on product detail page
 */
function initializeEvents() {
	var $pdpMain = $('#pdpMain');

	if(!$('.add-to-cart').data('events-added')){
		addToCart();
	}
	$('.add-to-cart').data('events-added',true);
	
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

/*
	$pdpMain.on('click', '.read-link.more', function (e) {
		e.preventDefault();
		$(this).parent().find('.closed').removeClass("closed").addClass("open");
		$(this).hide()
		$(this).parent().find('.read-link.less').show();
	});
	$pdpMain.on('click', '.read-link.less', function (e) { 
		e.preventDefault();
		$(this).parent().find('.open').removeClass("open").addClass("closed");
		$(this).hide();
		$(this).parent().find('.read-link.more').show();
	});
*/

	if($('.product-tabs .tab-video').length){
		
		$('.product-tabs .tab-video').find('iframe.productVid').each(function(index){
			var vidUrl = $(this).data('url'),
				vidID = vidUrl.split("v=")[1],
				iframeID = "productVid-"+ index+1;

			$(this).attr('id', iframeID);
			
			vidID = vidID != undefined ? vidID : vidUrl.split("youtu.be/")[1];
			$(this).attr('src', "https://www.youtube.com/embed/"+vidID);

		});
		
	}

	//Set recipe video iframe url if recipe video is present
	if($('.product-tabs .product-recipe-video').length){
		
		$('.product-tabs .product-recipe-video').each(function(index){
			var vidUrl = $(this).data('url'),
				vidID = vidUrl.split("v=")[1],
				iframeID = "productRecipeVid-"+ index+1;

			$(this).attr('id', iframeID);

			vidID = vidID != undefined ? vidID : vidUrl.split("youtu.be/")[1];
			$(this).find('iframe.recipeVid').attr('src', "https://www.youtube.com/embed/"+vidID);
			//console.log(vidID);
		});
		
		//var vidUrl = $('.product-tabs .product-recipe-video').data('url');
		//var vidID = vidUrl.split("v=")[1];
		//vidID = vidID != undefined ? vidID : vidUrl.split("youtu.be/")[1];
		//$('.product-recipe-video').find($('#recipe-vid').attr('src', "https://www.youtube.com/embed/"+vidID));
	}
	
	$('.product-compatibility > a').on('click', function (e) {
		e.preventDefault();
	});

	$('.product-tabs').fadeIn("slow");

	$('.product-tabs').on('tabsactivate', function( event, ui ) {
		$('.product-tabs').find('.expanded').removeClass("expanded");
		ui.newTab.toggleClass('expanded');
	});
	
	$('.desktop-tabs > li').each(function(index){
		$(this).attr("data-tab", index);
	});
	
	$('.mobile-tabs > li').each(function(index){
		$(this).attr("data-tab", index);
	});
	
	$('.tabs-menu').find('li > a').on('click', function(e){
		var tabNum = $(this).parent().data("tab");
		e.stopPropagation();
		e.preventDefault();
		$('.tabs-menu').find(".open").removeClass("open");
		$(this).parent().addClass("open").find(".tab-content").slideToggle();
		$("#pdpMain .product-detail .product-tabs").tabs({
			active: tabNum
		});
	});
	
	$pdpMain.on('click', '.featured-recipe-toggle', function(e){
		var $recipeContainer = $pdpMain.find('.recipe-tab-content');
		var $toggleRow = $(this).parent().parent();
		var $toggleIcon = $(this).find('.icon .fa');
		e.preventDefault();
		e.stopPropagation();
		$recipeContainer.find('.active').removeClass("active").find(".fa").toggleClass("fa-minus fa-plus");
		$toggleIcon.toggleClass("fa-plus fa-minus");
		$toggleRow.addClass("active");
		$(this).addClass("active");
		$('html, body').animate({scrollTop: $recipeContainer.offset().top},100);
	});
	$(".search-result-items").on("click",">li>.viewMore",function(e){
		e.preventDefault();
		var recs=$(e.target).closest("ul");
		TPromise.resolve($.ajax({
			type: 'GET',
			url: util.ajaxUrl(e.target.href)
		})).then(function(r){
			progress.hide();
			recs.append(r);
		},function(r){
			progress.hide();
		});
		$(e.target).parent().remove();
		progress.show(recs);
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
