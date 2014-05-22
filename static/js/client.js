(function($) {
	var pusher = new Pusher($("#pusherKey").val());
	var operations = {};

	$(document).ready(function() {
		$.get('/murals/1', function(data) {
			var $board = $("#board");

			Object.keys(data.widgets).map(function(k) {
				return _.extend({
					id: k
				}, data.widgets[k]);
			}).forEach(function(w) {
				$board.append(handleWidgetEvents($(widgetTemplate(w))));
			});

			var channel = pusher.subscribe('html5devconf2014');
			channel.bind('operation', function(payload) {
				payload.operations.forEach(function(operation) {
					var key = operation.property == "x" ? "left" : "top";
					$(".widget[data-id='" + operation.widget + "']").css(key, operation.value + 'px');
				});
			});
		});

		window.setInterval(function() {
			var keys = Object.keys(operations);
			if (keys.length == 0)
				return; // nothing to do here

			var sending = keys.map(function(o){ return operations[o]; });
			operations = {};

			$.ajaxq("opqueue", {
				method: 'post',
				url: '/murals/1',
				dataType: "json",
				contentType: "application/json; charset=utf-8",
				data: JSON.stringify({
					operations: sending,
					socketId: pusher.connection.socket_id
				})
			});
		}, 5 * 1000);
	});

	function widgetTemplate(widget) {
		return '<div data-id="' + widget.id + '" class="widget" style="top:' + widget.y + 'px; left:' + widget.x + 'px; background: ' + widget.color + '; width: ' + widget.width + 'px; height: ' + widget.height + 'px">' + '<h3>Hello, I\'m a Sticky Note</h3></div>';
	}

	function handleWidgetEvents($elem) {
		var elem = $elem.get(0);
		var initialX = 0,
			initialY = 0;

		Hammer(elem).on("dragstart", function(e) {
			initialX = parseInt($elem.css('left').replace(/px$/, ''), 10);
			initialY = parseInt($elem.css('top').replace(/px$/, ''), 10);
		});

		Hammer(elem).on("drag", function(e) {
			var x = initialX + e.gesture.deltaX;
			var y = initialY + e.gesture.deltaY;

			$elem.css('left', x).css('top', y);
		});

		Hammer(elem).on("dragend", function(e) {
			var y = parseInt($elem.css('top').replace(/px$/, ''), 10);
			var x = parseInt($elem.css('left').replace(/px$/, ''), 10);


			operations[$elem.data('id') + '-x'] = {
				action: 'update',
				property: 'x',
				value: x,
				widget: $elem.data('id')
			};

			operations[$elem.data('id') + '-y'] = {
				action: 'update',
				property: 'y',
				value: y,
				widget: $elem.data('id')
			};
		});

		return $elem;
	}
})(jQuery);