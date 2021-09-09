/**
 *    (c) 2009-2014 Demandware Inc.
 *    Subject to standard usage terms and conditions
 *    For all details and documentation:
 *    https://bitbucket.com/demandware/sitegenesis
 */

'use strict';

var countries = require('./countries'),
	cq = require('./cq'),
	dialog = require('./dialog'),
	minicart = require('./minicart'),
	page = require('./page'),
	rating = require('./rating'),
	searchplaceholder = require('./searchplaceholder'),
	searchsuggest = require('./searchsuggest'),
	searchsuggestbeta = require('./searchsuggest-beta'),
	searchsuggest2 = require('./searchsuggest2'),
	searchsuggestbeta2 = require('./searchsuggest-beta2'),
	tooltip = require('./tooltip'),
	util = require('./util'),
	validator = require('./validator');

// if jQuery has not been loaded, load from google cdn
if (!window.jQuery) {
	var s = document.createElement('script');
	s.setAttribute('src', 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js');
	s.setAttribute('type', 'text/javascript');
	document.getElementsByTagName('head')[0].appendChild(s);
}

require('./jquery-ext')();
require('./cookieprivacy')();
require('./returnorder')();

function initializeEvents() {
	var controlKeys = ['8', '13', '46', '45', '36', '35', '38', '37', '40', '39'];

	$('body')
		.on('keydown', 'textarea[data-character-limit]', function (e) {
			var text = $.trim($(this).val()),
				charsLimit = $(this).data('character-limit'),
				charsUsed = text.length;

				if ((charsUsed >= charsLimit) && (controlKeys.indexOf(e.which.toString()) < 0)) {
					e.preventDefault();
				}
		})
		.on('change keyup mouseup', 'textarea[data-character-limit]', function () {
			var text = $.trim($(this).val()),
				charsLimit = $(this).data('character-limit'),
				charsUsed = text.length,
				charsRemain = charsLimit - charsUsed;

			if (charsRemain < 0) {
				$(this).val(text.slice(0, charsRemain));
				charsRemain = 0;
			}

			$(this).next('div.char-count').find('.char-remain-count').html(charsRemain);
		});

	/**
	 * initialize search suggestions, pending the value of the site preference(enhancedSearchSuggestions)
	 * this will either init the legacy(false) or the beta versions(true) of the the search suggest feature.
	 * */
	var $searchContainer = $('#header .header-search');
	if (SitePreferences.LISTING_SEARCHSUGGEST_LEGACY) {
		searchsuggest.init($searchContainer, Resources.SIMPLE_SEARCH);
	} else {
		searchsuggestbeta.init($searchContainer, Resources.SIMPLE_SEARCH);
	}

	var $searchContainer2 = $('.category-search');
	if (SitePreferences.LISTING_SEARCHSUGGEST_LEGACY) {
		searchsuggest2.init($searchContainer2, Resources.SIMPLE_SEARCH);
	} else {
		searchsuggestbeta2.init($searchContainer2, Resources.SIMPLE_SEARCH);
	}

	// print handler
	$('.print-page').on('click', function () {
		window.print();
		return false;
	});

	// add show/hide navigation elements
	$('.secondary-navigation .toggle').click(function () {
		$(this).toggleClass('expanded').next('ul').toggle();
		if($(this).hasClass('cs-toggle')){
			$(this).find('.fa').toggleClass("fa-minus fa-plus")
		}else{
			$(this).find('.fa').toggleClass("fa-angle-down fa-angle-right")
		}
		
	});

	
	$('.expandable.active').find('> .fa').toggleClass('fa-angle-right fa-angle-down');
	
	$('.product-tile').each(function(){
		if(!$(this).find('.product-compatibility-content li').length){
			//$(this).find('.product-compatibility-link').hide();
		}
	});
	
	$('.product-compatibility-link').on('click', function(e){
		e.preventDefault();
		var compatibleContent = $(this).parent().find($(".product-compatibility-content"));
		
		dialog.open({
			options : {
				width: 640,
				maxHeight:720,
				closeOnEscape: true,
				dialogClass: 'compatible-products-dialog',
			},
			html : '<div class="compatible-products-dialog-content"></div>',
			callback: function(){
				compatibleContent.contents().clone().appendTo($('.compatible-products-dialog-content'));
				if(!$('.compatible-products-dialog-content .search-result-items').find('li').length){
					console.log("no items found");
				}
			}
		});
		
	})

	// add generic toggle functionality
	/*
	$('.toggle').next('.toggle-content').hide();
	$('.toggle').click(function (e) {
		console.log('clicked');
		e.preventDefault();
		$('.info-tabs').find('.expanded').removeClass("expanded");
		$(this).parent().addClass('expanded').next('.toggle-content').toggle();
	});
	*/
	
	// subscribe email box
	$('#footer-email-signup,form.email-signup').submit(function(e){
		e.preventDefault();
		dialog.open({url: util.appendParamToURL(this.action,'emailaddress',$(this).find('input[type=email]').val())});
	});
	
	//captcha validation
	var $loginForm = $('#dwfrm_login');
	$loginForm.submit(function(e){
		if($('.recaptcha-error').length > 0){
			if(window.grecaptcha.getResponse() == ""){
				e.preventDefault();
				if($('.recaptcha-error').hasClass('hide')){
					$('.recaptcha-error').removeClass('hide');
				}
			}else{
				if(!$('.recaptcha-error').hasClass('hide')){
					$('.recaptcha-error').addClass('hide');
				}
			}
		}
	});
	
	var $registrationForm = $('#RegistrationForm');
	$registrationForm.submit(function(e){
		if($('.recaptcha-error').length > 0){
			if(window.grecaptcha.getResponse() == ""){
				e.preventDefault();
				if($('.recaptcha-error').hasClass('hide')){
					$('.recaptcha-error').removeClass('hide');
				}
			}else{
				if(!$('.recaptcha-error').hasClass('hide')){
					$('.recaptcha-error').addClass('hide');
				}
			}
		}
	});
	
	
	$('a.privacy-policy').on('click', function (e) {
		e.preventDefault();
		dialog.open({
			url: $(e.target).attr('href'),
			options: {
				height: 600
			},
			callback: function () {
	            $('#dialog-container').scrollTop(0);
	        }
		});
	});

	//Set featured story iframe url if video is present
	if($('#featured-story').length){
		var vidUrl = $('.top-section iframe').data('url'),
			vidID = vidUrl.split("v=")[1];
			vidID = vidID != undefined ? vidID : vidUrl.split("youtu.be/")[1];

		$('.top-section iframe').attr('src', "https://www.youtube.com/embed/"+vidID).show();
	}

	// main menu toggle
	$('.menu-toggle').on('click', function () {
		//$('#wrapper, nav[role="navigation"], #footer, .footer-menu').toggleClass('menu-active');
		$('#wrapper').toggleClass('menu-active');
		$('nav[role="navigation"]').toggleClass('menu-active');
		$('#footer').toggleClass('menu-active');
		$('.footer-menu').toggleClass('menu-active');
		
		$(this).find('i').toggleClass('fa-bars fa-times');
		console.log("menu click");
	});

	// footer mobile menu toggle
	/*
	$('.menu-toggle').on('click', function () {
		//$('#wrapper, nav[role="navigation"], #footer, .footer-menu').toggleClass('menu-active');
		$('#wrapper').toggleClass('menu-active');
		$('nav[role="navigation"]').toggleClass('menu-active');
		$('#footer').toggleClass('menu-active');
		$('.footer-menu').toggleClass('menu-active');
		$(this).find('i').toggleClass('fa-bars fa-times');
	});
	*/

	$('#footer-nav').on('click', '.footer-nav-toggle', function () {
		if($('#wrapper').outerWidth() <= 767){
			//e.preventDefault();
			//$(this).parent('.user-info').toggleClass('active');
			$(this).find('.fa').toggleClass('fa-minus fa-plus');
			$(this).parent().toggleClass('active');
		}
	});

	
	$('#navigation .menu-item.has-submenu > a').on('click', function(e){
		if($("#wrapper").width() <= 767){
			e.preventDefault();
			var $parent = $(this).parent();
			$parent.siblings('.active').find('.fa').toggleClass('fa-plus fa-minus');
			$parent.siblings('li').removeClass('active');
			$(this).find('.fa').toggleClass('fa-plus fa-minus');
			$parent.toggleClass("active");
			
		}
	});
	
	$('.toggle-map').on('click', function(e){
		e.preventDefault();
		var txt = $(this).text(),
			id 	= $(this).attr("data-id");
		txt != "View Map" ? $(this).text("View Map") : $(this).text("Hide Map");
		$(this).parents().find('.map[data-id="'+id+'"]').toggle();
	});
		
}
/**
 * @private
 * @function
 * @description Adds class ('js') to html for css targeting and loads js specific styles.
 */
function initializeDom() {
	// add class to html for css targeting
	$('html').addClass('js');
	if (SitePreferences.LISTING_INFINITE_SCROLL) {
		$('html').addClass('infinite-scroll');
	}
	// load js specific styles
	util.limitCharacters();
}

var pages = {
	account: require('./pages/account'),
	cart: require('./pages/cart'),
	checkout: require('./pages/checkout'),
	compare: require('./pages/compare'),
	product: require('./pages/product'),
	recipe: require('./pages/recipe'),
	registry: require('./pages/registry'),
	search: require('./pages/search'),
	storefront: require('./pages/storefront'),
	wishlist: require('./pages/wishlist'),
	video: require('./pages/video'),
	storelocator: require('./pages/storelocator')
};

var app = {
	init: function () {
		if (document.cookie.length === 0) {
			$('<div/>').addClass('browser-compatibility-alert').append($('<p/>').addClass('browser-error').html(Resources.COOKIES_DISABLED)).appendTo('#browser-check');
		}
		initializeDom();
		initializeEvents();

		// init specific global components
		countries.init();
		tooltip.init();
		minicart.init();
		validator.init();
		rating.init();
		searchplaceholder.init();
		cq.init();
		// execute page specific initializations
		$.extend(page, window.pageContext);
		var ns = page.ns;
		if (ns && pages[ns] && pages[ns].init) {
			pages[ns].init();
		}
		page.setActiveCat();
		page.mobileSearchToggle();
		page.cookieBannerClose();
        page.cookieBannerCheckClose();
	}
};

// general extension functions
(function () {
	String.format = function () {
		var s = arguments[0];
		var i, len = arguments.length - 1;
		for (i = 0; i < len; i++) {
			var reg = new RegExp('\\{' + i + '\\}', 'gm');
			s = s.replace(reg, arguments[i + 1]);
		}
		return s;
	};
})();

(function($,sr){

	  // debouncing function from John Hann
	  // http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	  var debounce = function (func, threshold, execAsap) {
	      var timeout;

	      return function debounced () {
	          var obj = this, args = arguments;
	          function delayed () {
	              if (!execAsap)
	                  func.apply(obj, args);
	              timeout = null;
	          };

	          if (timeout)
	              clearTimeout(timeout);
	          else if (execAsap)
	              func.apply(obj, args);

	          timeout = setTimeout(delayed, threshold || 500);
	      };
	  }
		// smartresize
		jQuery.fn[sr] = function(fn){  return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr); };

	}(jQuery,'smartresize'));

// initialize app
$(document).ready(function () {
	app.init();
});
