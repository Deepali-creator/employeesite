'use strict';
exports.init = function () {
	
		//console.log("flexslider called");
		
		$('#homepage-slider.flexslider').flexslider({
			animation: "slide",
			animationLoop: true,
			slideshow: true,
			directionNav: false,
			controlNav: true,
			useCSS: true,
			slideshowSpeed: 5000
		});

};
