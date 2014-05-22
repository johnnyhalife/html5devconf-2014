(function($) {
	$(document).ready(function() {
		$('.widget').each(function(i, elem){
			var initialX = 0, initialY = 0;

			Hammer(elem).on("dragstart", function(e) {
				var $elem = $(elem);

				initialX = parseInt($elem.css('left').replace(/px$/, ''), 10);
				initialY = parseInt($elem.css('top').replace(/px$/, ''), 10);
			});

			Hammer(elem).on("drag", function(e) {
				var $elem = $(elem);

				$elem.css('left', initialX + e.gesture.deltaX)
					.css('top', initialY + e.gesture.deltaY);
			});
		});
	});
})( jQuery );