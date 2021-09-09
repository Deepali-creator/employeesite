'use strict';

var imagesLoaded = require('imagesloaded'),
	addToCart = require('./pages/product/addToCart'),
	quickview = require('./quickview');

function initQuickViewButtons() {
	$('.tiles-container .product-image').on('mouseenter', function () {
		var $qvButton = $('#quickviewbutton');
		if ($qvButton.length === 0) {
			//$qvButton = $('<a id="quickviewbutton" class="quickview"><i class="fa fa-search"></i> ' + Resources.QUICK_VIEW + '</a>');
		}
		var $link = $(this).find('.thumb-link');
		$qvButton.attr({
			'href': $link.attr('href'),
			'title': $link.attr('title')
		}).appendTo(this);
		$qvButton.on('click', function (e) {
			e.preventDefault();
			quickview.show({
				url: $(this).attr('href'),
				source: 'quickview'
			});
		});
	});
}

function gridViewToggle() {
	$('.toggle-grid').on('click', function () {
		$('.search-result-content').toggleClass('wide-tiles');
		$(this).toggleClass('wide');
	});
}

function syncTileElements() {
    var $gridTiles = $('.tiles-container .grid-tile'),
        tilesPerRow = 2,
        totalTiles = $gridTiles.length,
        totalRows = Math.ceil(totalTiles / tilesPerRow),
        tileCount = 1,
        rowCount = 1,
		rowNum = 1;
		


    if ($gridTiles.length === 0) { return; }

    // Redefine variable for desktop
    if(window.matchMedia("(min-width: 48em)").matches) {
        tilesPerRow = 3;
    }

    // Redefine variable for product slider
    if($('.tiles-container.recommendation-slider, .tiles-container.slider').length){
        tilesPerRow = 500;
    }

    // Add same class to all tiles in a row
    $gridTiles.each(function(index){
        $(this).addClass("row" + rowNum); // Add row class
        if(tileCount % tilesPerRow == 0){ // check if a new row is starting
            rowNum++; // increase row number
        }
        tileCount++; // increase tile count
    });

    // Sync element heights
    imagesLoaded('.tiles-container').on('done', function () {
        while(rowCount <= totalRows){
            $('.tiles-container .grid-tile.row' + rowCount + ' .product-name').syncHeight();
            $('.tiles-container .grid-tile.row' + rowCount + ' .product-swatches').syncHeight();
            $('.tiles-container .grid-tile.row' + rowCount + ' .product-promo').syncHeight();
            rowCount++;
        }
    });
}

function setTileElementsDefaults() {
    //remove row class designation
    $('.tiles-container .grid-tile').removeClass(function (index, css) {
        return (css.match (/\brow\S+/g) || []).join(' '); // removes anything that starts with "row"
    });

    //Remove inline styles
    $('.tiles-container .grid-tile .product-name, .tiles-container .grid-tile .product-swatches').attr( "style", "" );;
}

/**
 * @private
 * @function
 * @description Initializes events on the product-tile for the following elements:
 * - swatches
 * - thumbnails
 */
function initializeEvents() {
	initQuickViewButtons();
	gridViewToggle();
	$('.swatch-list').on('mouseleave', function () {
		// Restore current thumb image
		var $tile = $(this).closest('.product-tile'),
			$thumb = $tile.find('.product-image .thumb-link img').eq(0),
			data = $thumb.data('current');

		$thumb.attr({
			src: data.src,
			alt: data.alt,
			title: data.title
		});
	});
	$('.swatch-list .swatch').on('click', function (e) {
		e.preventDefault();
		if ($(this).hasClass('selected')) { return; }

		var $tile = $(this).closest('.product-tile');
		$(this).closest('.swatch-list').find('.swatch.selected').removeClass('selected');
		$(this).addClass('selected');
		$tile.find('.thumb-link').attr('href', $(this).attr('href'));
		$tile.find('name-link').attr('href', $(this).attr('href'));

		var data = $(this).children('img').filter(':first').data('thumb');
		var $thumb = $tile.find('.product-image .thumb-link img').eq(0);
		var currentAttrs = {
			src: data.src,
			alt: data.alt,
			title: data.title
		};
		$thumb.attr(currentAttrs);
		$thumb.data('current', currentAttrs);
	}).on('mouseenter', function () {
		// get current thumb details
		var $tile = $(this).closest('.product-tile'),
			$thumb = $tile.find('.product-image .thumb-link img').eq(0),
			data = $(this).children('img').filter(':first').data('thumb'),
			current = $thumb.data('current');

		// If this is the first time, then record the current img
		if (!current) {
			$thumb.data('current', {
				src: $thumb[0].src,
				alt: $thumb[0].alt,
				title: $thumb[0].title
			});
		}

		// Set the tile image to the values provided on the swatch data attributes
		$thumb.attr({
			src: data.src,
			alt: data.alt,
			title: data.title
		});
	});
	// must prevent listener from being added twice, otherwise multiple products will be added per click
	if(!$('.add-to-cart').data('events-added')){
		addToCart();
	}
	$('.add-to-cart').data('events-added',true);

	function setTileElementsDefaults() {
		//remove row class designation
		$('.tiles-container .grid-tile').removeClass(function (index, css) {
			return (css.match (/\brow\S+/g) || []).join(' '); // removes anything that starts with "row"
		});
	
		//Remove inline styles
		$('.tiles-container .grid-tile .product-name, .tiles-container .grid-tile .product-swatches').attr( "style", "" );;
	}

	$(window).smartresize(function(){
        setTileElementsDefaults();
        syncTileElements();
	});
	
	$(window).ajaxComplete(function() {
		setTileElementsDefaults();
		syncTileElements();
	})
}

exports.init = function () {
	// var $tiles = $('.tiles-container .grid-tile > div');
	// if ($tiles.length === 0) { return; }
	// imagesLoaded('.tiles-container').on('done', function () {
	// 	$tiles.syncHeight()
	// 		.each(function (idx) {
	// 			$(this).data('idx', idx);
	// 		});
	// });

	syncTileElements();
	initializeEvents();
};
