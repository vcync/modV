var stretch = function() {
	this.info = {
		name: 'stretch',
		author: '2xAA',
		version: 0.1
	};

	function getMousePos(evt, canvas) {
		var rect = canvas.getBoundingClientRect();
		return {
			x: evt.clientX - rect.left,
			y: evt.clientY - rect.top
		};
	}

	var stretchX = 0;
	var stretchY = 0;

	this.init = function(canvas) {
		canvas.addEventListener('mousemove', function(evt) {
			var mousePos = getMousePos(evt, canvas);
			stretchX = mousePos.x-50;
			stretchY = mousePos.y-50;
		}, false);
		
		try {
		
			Leap.loop(function(frame) {
				frame.hands.forEach(function(hand, index) {
					var pos = hand.screenPosition();
					stretchX = pos[0]-50;
					stretchY = pos[1]-50;
					console.log(pos[0], pos[1]);
				});
			}).use('screenPosition', {scale: 0.25});
			Leap.loopController.setBackground(true);
			
		} catch(e) {
			
		}
	}

	this.draw = function(canvas, ctx) {
		ctx.save();
		ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height, -stretchX/2, -stretchY/2, canvas.width+stretchX, canvas.height+stretchY);
		ctx.restore();
	};
};