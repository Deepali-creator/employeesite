'use strict';

var util = require('./util');

var page = {
	title: '',
	type: '',
	params: util.getQueryStringParams(window.location.search.substr(1)),
	redirect: function (newURL) {
		setTimeout(function () {
			window.location.href = newURL;
		}, 0);
	},
	refresh: function () {
		setTimeout(function () {
			window.location.assign(window.location.href);
		}, 500);
	},
	setActiveCat: function () {
		var currentCat;
		$('.breadcrumb-element:not(:last-child)').each(function(){
			currentCat = $(this).text();
			$('.menu-item a:contains('+currentCat+')').parent().addClass("activeCat");
		});
	},
	mobileSearchToggle: function () {
		$( ".mobile-search-toggle" ).on( "click", function( event ) {
			$(this).toggleClass("active");
			$('.header-search').toggleClass("active");
		});
	},
	cookieBannerClose:  function () {
        $( ".cookie-policy-warning a.close-button" ).on( "click", function( event ) {
            event.preventDefault();
            $.cookie('CookieBannerClosed', 'YES', { path: '/' });
            $('.cookie-policy-warning').hide();
        });
    },
    cookieBannerCheckClose:  function () {
        if ($.cookie('CookieBannerClosed')) {
            $('.cookie-policy-warning').hide();
        } else {
            $('.cookie-policy-warning').show();
        }
    }
};

module.exports = page;
