'use strict';
exports.init = function () {
		
	$('#homepage-slider.flexslider').flexslider({
		animation: "slide",
		animationLoop: true,
		slideshow: true,
		directionNav: false,
		controlNav: true,
		useCSS: true,
		slideshowSpeed: 3000
	});
		
	var ig = $('#ig-feed'),
		igURL = "https://api.instagram.com/v1/users/self/media/recent/?access_token=1106695040.3f2d556.e5a18420401c45bbabd51a983d804eea&count=3";
		
	$.ajax({
		url:igURL,
		type: 'GET',
		dataType: "jsonp",
		success: function(result){
			var post = result.data,
				html = "";
					
			$.each(post, function(i){
				var postLink = post[i].link,
					postImage = post[i].images.standard_resolution.url,
					postCaption = post[i].caption.text,
					postUser = post[i].caption.from.username;
							
					html = '<li class="tile"><a href="'+postLink+'" target="_blank" title="Discover on Instagram"><div class="image-wrap"><img src="'+postImage+'" alt="@'+postUser+'"/></div><p class="post-caption">'+ postCaption+'" <span class="view-desc-link" href="#"><span>Read More</span></span></p></a></li>';
					$(ig).append(html);
	
					return i < 2;
			});
					
		},
		error: function(){
			html = "<li><p>An unknown error has occurred. Please refresh the page and try again.</p></li>";
			$(ig).append(html)
		}
	});

	$(window).on('load', function(){
		var $igImage = $('.discover-tiles .image-wrap').find('img');


		$igImage.each(function(){
			var imgW = $(this).outerWidth(),
				imgH = $(this).outerHeight(),
				base = 300;

			//console.log("w: "+ imgW + "|" + "h: "+ imgH)

			if(imgW > imgH){
				//$(this).parent().addClass("forceWidth");
				if(imgH > base){
					$(this).parent().addClass("forceAll");
				}else{
					$(this).parent().addClass("forceWidth");
				}
			}else if(imgH > imgW){
				//$(this).parent().addClass("forceHeight");
				if(imgW > base){
					$(this).parent().addClass("forceAll");
				}else{
					$(this).parent().addClass("forceHeight");
				}
			}

		});

		$igImage.show();
	})
	
	
	
};
