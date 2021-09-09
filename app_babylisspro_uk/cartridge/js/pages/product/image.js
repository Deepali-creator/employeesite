'use strict';
var dialog = require('../../dialog'),
	util = require('../../util');

var zoomMediaQuery = matchMedia('(min-width: 960px)');

/**
 * @description Enables the zoom viewer on the product detail page
 * @param zmq {Media Query List}
 */
var loadZoom = function (zmq) {
	var $imgZoom = $('#pdpMain .main-image'),
		hiresUrl;

	if (!zmq) {
		zmq = zoomMediaQuery;
	}
	if ($imgZoom.length === 0 || dialog.isActive() || util.isMobile() || !zoomMediaQuery.matches) {
		// remove zoom
		$imgZoom.trigger('zoom.destroy');
		return;
	}
	hiresUrl = $imgZoom.attr('href');

	if (hiresUrl && hiresUrl !== 'null' && hiresUrl.indexOf('noimagelarge') === -1 && zoomMediaQuery.matches) {
		$imgZoom.zoom({
			url: hiresUrl
		});
	}
};

zoomMediaQuery.addListener(loadZoom);

/**
 * @description Sets the main image attributes and the href for the surrounding <a> tag
 * @param {Object} atts Object with url, alt, title and hires properties
 */
var setMainImage = function (atts) {
	$('#pdpMain .primary-image').attr({
		src: atts.url,
		alt: atts.alt,
		title: atts.title
	});
	$('#pdpMain .main-image').attr({
		href: atts.url.split('?')[0]
	});
	
	if (!dialog.isActive() && !util.isMobile()) {
		$('#pdpMain .main-image').attr('href', atts.hires);
	}
	loadZoom();
};

/**
 * @description Replaces the images in the image container, for eg. when a different color was clicked.
 */
var replaceImages = function () {
	var $newImages = $('#update-images'),
		$imageContainer = $('#pdpMain .product-image-container');
	if ($newImages.length === 0) { return; }

	$imageContainer.html($newImages.html());
	$newImages.remove();
	loadZoom();
};

function thumbsInit(){
	var thumbs = $('.thumbs-wrap');
	var maxHeight = $('.main-image').height();
	var thumbHeight = $('li.thumb').height();
	var thumbsHeight = thumbs.height();
	
	if(thumbs.length && (thumbs.height() >= maxHeight)){
		thumbs.height(thumbsHeight).addClass('overflow');
		if(!$('.thumbNav').length){
			$("<a href='#' class='thumbNav prev-thumbs disabled' data-title='prev'><span>prev</span></a><ul class='overflow-block'></ul><a href='#' class='thumbNav next-thumbs' data-title='next'><span>next</span></a>").prependTo(thumbs);
			thumbs.find('ul').contents().clone().appendTo('.overflow-block');
			checkPos();
		}
	}
	
	// PDP Mobile Flexslider Init
	if($('#thumbnails .thumb').length){
		$('.pdp-main .product-col-1 #thumbnails ul:not(.video-thumbs)').contents().clone().removeClass('selected').removeClass('thumb').appendTo('.product-col-1 .mobile-images-block ul.slides');
		$('.product-primary-image').addClass("mobile-thumbs-active");
		if($('.video-thumbs').length){
			var $vidLink = $('.video-thumbs').find('.videothumb');
			var atts = $('videoproductthumbnail').prop("attributes");
			if(!$('.videoLinkText').length){
				$vidLink.find('a').clone().insertAfter('.mobile-images-block').addClass('videoproductthumbnail videoLinkText').text("View Video");
				$('.videoproducttext').find('img').remove();
			}
		}
	} else {
		$('.product-col-1 .mobile-images-block ul').hide();
		//$('.pdp-main .product-col-1 .product-primary-image .product-image img').clone().appendTo('.product-col-1 .mobile-images-block');
	};
	
	$('.mobile-images-block').flexslider({
		animation: "slide",
		animationLoop: false,
		directionNav: true,
		controlNav: false,
		slideshow: false
	});
	
	$('.zoomImg').each(function(){
		$(this).attr('alt',$('.primary-image').attr('alt'));
	});
};

function checkPos(){
	var thumbs = $('.thumbs-wrap');
	var maxHeight = $('.main-image').height();
	var thumbsWrap = thumbs.height(),
		blockPos = $('.overflow-block').position();
	var posTop = blockPos.top,
		posBtm  = blockPos.top + $('.overflow-block').height() ;

	if(posTop==0 || posTop >= 35){
		$('.prev-thumbs').addClass('disabled');
	}else{
		$('.prev-thumbs').removeClass('disabled');
	}	

	if(posBtm < maxHeight - 70){
		$('.next-thumbs').addClass('disabled');
	}else{
		$('.next-thumbs').removeClass('disabled');
	}
};
/* @module image
 * @description this module handles the primary image viewer on PDP
 **/

/**
 * @description by default, this function sets up zoom and event handler for thumbnail click
 **/
module.exports = function () {
	if (dialog.isActive() || util.isMobile()) {
		//$('#pdpMain .main-image').removeAttr('href');
	}
	loadZoom();
	// handle product thumbnail click event
	$('#pdpMain').on('click', '.productthumbnail', function (e) {
		// switch indicator
		e.preventDefault();
		$(this).closest('.product-thumbnails').find('.thumb.selected').removeClass('selected');
		$(this).closest('.thumb').addClass('selected');

		setMainImage($(this).data('lgimg'));
	});
	var thumbs = $('.thumbs-wrap');

	$(window).on('load', function(){
		thumbsInit();
		checkHeight();
		checkPos();
	});
	
	$(window).smartresize(function(){
		thumbsInit();
		if(thumbs.length && $('.overflow-block').length){
			checkHeight();
			checkPos();
		}
	});
	

	
	function checkHeight(){
		var max = $('.main-image').height();
		thumbs.height(max);
	};
	
	$('.main-image').on('click', function(e){
		e.preventDefault();
		var imgUrl = $(this).attr('href');
		
		$('.ui-dialog.product-image-zoom').remove();
		var $dialog = $('<div id="dialog-container" class="dialog-content ui-dialog-content ui-widget-content product-image-zoom" ><img src="' + imgUrl + '" /></div>')
		.dialog({
			autoOpen: false,
			resizeable: false,
			modal: true,
			width: 960,
			closeOnEscape: true,
			dialogClass: 'zoom'
		});
		$dialog.dialog('open');
	});
	
	
	$('.thumbs-wrap').on('click', '.thumbNav', function(e){
		e.preventDefault();
		var maxHeight = $('.main-image').height();
		var thumbsWrap = thumbs.height(),
		blockPos = $('.overflow-block').position();
		var posTop = blockPos.top,
		posBtm  = blockPos.top + $('.overflow-block').height();
		if($(this).attr('data-title') == "prev"){
			//posTop+=146;
			posTop+=105;
			
			if (posTop > 35) {
				posTop = 0;
			}
			
			
			thumbs.find('.overflow-block').stop().animate({
			        top: posTop
			    }, 500).promise().done(checkPos);
		}else if($(this).attr('data-title') == "next"){
			posTop-=105;
			thumbs.find('.overflow-block').stop().animate({
		        top: posTop,
		        complete: checkPos()
		    }, 500).promise().done(checkPos);
		}
	});
};

module.exports.loadZoom = loadZoom;
module.exports.setMainImage = setMainImage;
module.exports.replaceImages = replaceImages;
module.exports.thumbsInit = thumbsInit;
