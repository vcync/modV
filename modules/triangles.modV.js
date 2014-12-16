var triangles = function() {
	
	this.info = {
		name: 'triangles',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'width', min: 0, max: 800, label: 'Width'},
			{type: 'range', variable: 'height', min: 0, max: 800, label: 'Height'},
			{type: 'range', variable: 'x', min: 0, max: 800, label: 'X'},
			{type: 'range', variable: 'y', min: 0, max: 800, label: 'Y'}
		]
	};

	this.width = 200;
	this.height = 200;
	this.x = 0;
	this.y = 0;

	this.init = function(canvas, ctx) {
		this.x = canvas.width/2;
		this.y = canvas.height/2;
	};

	function drawTriangle(context, x, y, triangleWidth, triangleHeight, fillStyle) {
		context.beginPath();
		context.moveTo(x, y);
		context.lineTo(x + triangleWidth / 2, y + triangleHeight);
		context.lineTo(x - triangleWidth / 2, y + triangleHeight);
		context.closePath();
		context.fillStyle = fillStyle;
		context.fill();
	}

	this.draw = function(canvas, ctx) {
		var all = 0;
		for(var i=0; i<64; i++) {
			all += amplitudeArray[i];
		}
		all = all/1000;
		drawTriangle(ctx, this.x, this.y, this.width+(all*4), this.height+(all*4), 'black');
	};

};
triangles = new triangles();