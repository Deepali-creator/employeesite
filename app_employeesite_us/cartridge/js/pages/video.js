'use strict';

var dialog = require('../dialog'),
	util = require('../util'),
	sendToFriend = require('../send-to-friend');

function videoMenuToggle() {
	var $videoListToggler = $('.video-sidebar-menu h3');
	$videoListToggler.on('click', function (e) {
		$videoListToggler.toggleClass('js-active');
	});
}

function checkForMore() {
	var lastVideo = $("ul.video-search-list>li.grid-tile").last();
	if(lastVideo.data("next-page").length===0){
		$("a.viewMore").hide();
	}else{
		$("a.viewMore").show().attr("href", lastVideo.data("next-page"));
	}
}

function updateActiveSidebarItem(elActivatedLink) {
	var $this = $(elActivatedLink);
	var $videoCategoryLinks = $('.video-category_link');
	$('.video-sidebar-menu h3').removeClass('js-active');
	$videoCategoryLinks.removeClass('active');
	$this.addClass('active');
}

/**
 * @description Initialize event handlers on recipe detail page
 */
function initializeEvents() {
	$('.videos-main').on('click','.videoView', function (e) {
		e.preventDefault();
		var vidId = $(this).data("code");
		dialog.open({
			options: {
				width: 640,
				height: 420,
				closeOnEscape: true,
				dialogClass: 'video-dialog',
				open: function () {
					//Pause Featured Video if it is playing
					document.getElementById('featured-video').contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
				},
				close: function () {
					//Remove the modal video on close to prevent overplaying
					$(this).html('');
					$(this).dialog('close');
				}
			},
			html: '<iframe width="100%" height="315" src="https://www.youtube.com/embed/' + vidId + '?autoplay=1" frameborder="0" allowfullscreen></iframe>',
			callback: function () {
				$('.video-dialog iframe').fadeIn();
			},
			beforeClose: function (event, ui) {
				console.log('close');
			}
		});
	}).on('click', '.video-button', function (e) {
		e.preventDefault();
		var vidUrl = $(this).data('url'),vidID;
		//Extract ID from standard URL
		vidID = vidUrl.split("v=")[1];
		//Extract ID from share URL
		vidID = vidID != undefined ? vidID : vidUrl.split("youtu.be/")[1];

		dialog.open({
			options: {
				width: 640,
				height: 420,
				closeOnEscape: true,
				dialogClass: 'video-dialog',
			},
			html: '<iframe width="100%" height="315" src="https://www.youtube.com/embed/' + vidID + '" frameborder="0" allowfullscreen"></iframe>',
			callback: function () {
				$('.video-dialog iframe').fadeIn();
			}
		});
	}).on('click', '.viewMore', function (e) {
		e.preventDefault();
		$.ajax({
			url: this.href,
			success: function (result) {
				$(".grid-tile").last().after(result);
				checkForMore();
			}
		});
	}).on("click", ".video-category_link", function (e) {
		e.preventDefault(this);
		var url = util.appendParamsToUrl(Urls.viewGridDisplay, {
				folder_id: $(this).data('folder')
			});
		updateActiveSidebarItem(this);
		$.ajax({
			url: url,
			success: function (result) {
				$("#primary").replaceWith(result);
				checkForMore();
			}
		});
	}).find('iframe.featured-vid').each(function () {
		var vidUrl = $(this).data('url');
		var vidID = vidUrl.split("v=")[1];
		vidID = vidID != undefined ? vidID : vidUrl.split("youtu.be/")[1];
		$(this).attr('src', "https://www.youtube.com/embed/" + vidID);
	});
	videoMenuToggle();
	checkForMore();
}

var video = {
	initializeEvents: initializeEvents,
	init: function () {
		initializeEvents();
	}
};

module.exports = video;
