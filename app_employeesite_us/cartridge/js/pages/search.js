'use strict';

var compareWidget = require('../compare-widget'),
	productTile = require('../product-tile'),
	progress = require('../progress'),
	util = require('../util');

function infiniteScroll() {
	// getting the hidden div, which is the placeholder for the next page
	var loadingPlaceHolder = $('.infinite-scroll-placeholder[data-loading-state="unloaded"]');
	// get url hidden in DOM
	var gridUrl = loadingPlaceHolder.attr('data-grid-url');

	//if (loadingPlaceHolder.length === 1 && util.elementInViewport(loadingPlaceHolder.get(0), 250)) {
		// switch state to 'loading'
		// - switches state, so the above selector is only matching once
		// - shows loading indicator
		loadingPlaceHolder.attr('data-loading-state', 'loading');
		loadingPlaceHolder.addClass('infinite-scroll-loading');

		/**
		 * named wrapper function, which can either be called, if cache is hit, or ajax repsonse is received
		 */
		var fillEndlessScrollChunk = function (html) {
			//loadingPlaceHolder.removeClass('infinite-scroll-loading');
			//loadingPlaceHolder.attr('data-loading-state', 'loaded');
			$('div.search-result-content').append(html);
		};

		// old condition for caching was `'sessionStorage' in window && sessionStorage["scroll-cache_" + gridUrl]`
		// it was removed to temporarily address RAP-2649
		if (false) {
			// if we hit the cache
			fillEndlessScrollChunk(sessionStorage['scroll-cache_' + gridUrl]);
		} else {
			// else do query via ajax
			$.ajax({
				type: 'GET',
				dataType: 'html',
				url: gridUrl,
				success: function (response) {
					// put response into cache
					try {
						sessionStorage['scroll-cache_' + gridUrl] = response;
					} catch (e) {
						// nothing to catch in case of out of memory of session storage
						// it will fall back to load via ajax
					}
					// update UI
					loadingPlaceHolder.remove();
					fillEndlessScrollChunk(response);
					productTile.init();
				}
			});
		}
	//}
}
/**
 * @private
 * @function
 * @description replaces breadcrumbs, lefthand nav and product listing with ajax and puts a loading indicator over the product listing
 */
function updateProductListing() {
	var hash = location.href.split('#')[1];
	if (hash === 'results-content' || hash === 'results-products') { return; }
	var refineUrl;

	if (hash.length > 0) {
		refineUrl = window.location.pathname + '?' + hash;
	} else {
		return;
	}
	progress.show($('.search-result-content'));
	$('#main').load(util.appendParamToURL(refineUrl, 'format', 'ajax'), function () {
		compareWidget.init();
		productTile.init();
		progress.hide();
	});
}

function toggleSearchFilters() {
	var $toggleFiltersLink = $('.js-hide-filters'),
		$filterContent = $('.refinement-container .inner');

	$('.refinement-container .refinement').each(function(){
		if( !$.trim( $(this).html() ).length ) {
			$(this).remove();
		}
	});

	if( !$.trim( $('.refinement-container .refinement').html() ).length ) {
		$toggleFiltersLink.hide();
	}


	$('#main').on('click', '.hide-filters-link', function(e) {
		e.preventDefault();
		$('.refinement-container .inner').slideToggle();
		$('.js-hide-filters').toggleClass('active');

		if ($toggleFiltersLink.hasClass('active')) {
			$toggleFiltersLink.text(Resources.HIDE_FILTERS);
		} else {
			$toggleFiltersLink.text(Resources.SHOW_FILTERS);
		}
	});
}

/**
 * @private
 * @function
 * @description Initializes events for the following elements:<br/>
 * <p>refinement blocks</p>
 * <p>updating grid: refinements, pagination, breadcrumb</p>
 * <p>item click</p>
 * <p>sorting changes</p>
 */
function initializeEvents() {
	var $main = $('#main');
	// compare checked
	$main.on('click', 'input[type="checkbox"].compare-check', function () {
		var cb = $(this);
		var tile = cb.closest('.product-tile');

		var func = this.checked ? compareWidget.addProduct : compareWidget.removeProduct;
		var itemImg = tile.find('.product-image a img').first();
		func({
			itemid: tile.data('itemid'),
			uuid: tile[0].id,
			img: itemImg,
			cb: cb
		});

	});

	var wrapW = $('.wrap').outerWidth();
	if(wrapW <=480){
		//console.log("mobile");
		if(!$('#primary .refinement-container').length){
			$('.refinement-container').insertAfter('.mobile-refinements .refinement-toggle');
		}
	}

	$(window).smartresize(function(){
		wrapW = $('.wrap').outerWidth();

		if(wrapW <=480){
			//console.log(wrapW + " mobile");
			if(!$('#primary .refinement-container').length){
				$('.refinement-container').insertAfter('.mobile-refinements .refinement-toggle');
			}
		}else{
			//console.log(wrapW + " not mobile");
			if(!$('#secondary .refinement-container').length){
				$('.refinement-container').insertAfter('#secondary h2.visually-hidden');
			}
		}

	});


	$main.on('click', '.refinement-toggle, .category-level-toggle', function(e) {
		e.preventDefault();
		$(this).parent().toggleClass('active');
		$(this).find('.fa').toggleClass("fa-plus fa-minus");

		if($(this).hasClass('level-1')){
			$(this).find('.fa').toggleClass('fa-angle-down fa-angle-right');
		}
	});

	$('.refinement').each(function(){
		if($(this).find('.refinement-item').hasClass('selected') ){
			$(this).addClass('expanded').find('.fa-plus').toggleClass("fa-plus fa-minus");
		}
	})

	// handle toggle refinement blocks
	$main.on('click', '.refinement h3', function () {
		$(this).parent().toggleClass('expanded');
		$(this).find('.fa').toggleClass("fa-plus fa-minus");
	});

	/*
	// handle events for updating grid
	$main.on('click', '.refinements a:not(.thumb-link), .pagination a, .breadcrumb-refinement-value a', function () {
		if ($(this).parent().hasClass('unselectable')) { return; }
		var catparent = $(this).parents('.category-refinement');
		var folderparent = $(this).parents('.folder-refinement');

		//if the anchor tag is uunderneath a div with the class names & , prevent the double encoding of the url
		//else handle the encoding for the url
		if (catparent.length > 0 || folderparent.length > 0) {
			return true;
		} else {
			var query = util.getQueryString(this.href);
			if (query.length > 1) {
				window.location.hash = query;
			} else {
				window.location.href = this.href;
			}
			return false;
		}
	});
	*/

	// handle events item click. append params.
	$main.on('click', '.product-tile a:not("#quickviewbutton")', function () {
		var a = $(this);
		// get current page refinement values
		var wl = window.location;

		var qsParams = (wl.search.length > 1) ? util.getQueryStringParams(wl.search.substr(1)) : {};
		var hashParams = (wl.hash.length > 1) ? util.getQueryStringParams(wl.hash.substr(1)) : {};

		// merge hash params with querystring params
		var params = $.extend(hashParams, qsParams);
		if (!params.start) {
			params.start = 0;
		}
		// get the index of the selected item and save as start parameter
		var tile = a.closest('.product-tile');
		var idx = tile.data('idx') ? + tile.data('idx') : 0;

		// convert params.start to integer and add index
		params.start = (+params.start) + (idx + 1);
		// set the hash and allow normal action to continue
		a[0].hash = $.param(params);
	});

	// handle sorting change
	$main.on('change', '.sort-by select', function () {
		var refineUrl = $(this).find('option:selected').val();
		var queryString = util.getQueryString(refineUrl);
		window.location.hash = queryString;
		return false;
	})
	.on('change', '.items-per-page select', function () {
		var refineUrl = $(this).find('option:selected').val();
		var queryString = util.getQueryString(refineUrl);
		if (refineUrl === 'INFINITE_SCROLL') {
			$('html').addClass('infinite-scroll').removeClass('disable-infinite-scroll');
		} else {
			$('html').addClass('disable-infinite-scroll').removeClass('infinite-scroll');
			window.location.hash = queryString;
		}
		return false;
	});

	// handle hash change
	window.onhashchange = updateProductListing;

	$main.on("click",".search-result-items>.product-tile_view-more>.viewMore",function(e){
		e.preventDefault();
		var ul=$(e.target).closest(".search-result-items");
		progress.show(ul.load(e.target.href,function(){
			progress.hide();
		}));
		progress.show(ul);
	});
}

exports.InfiniteScroll=infiniteScroll;

exports.init = function () {
	compareWidget.init();
	/*if (SitePreferences.LISTING_INFINITE_SCROLL) {
		$(window).on('scroll', infiniteScroll);
	}*/
	$("#primary").on("click",".infinite-scroll-placeholder",function(e){
		e.preventDefault();
		infiniteScroll();
	});
	productTile.init();
	initializeEvents();
	toggleSearchFilters();
};
