var tile = function() {
	this.info = {
		name: 'tile',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'tileWidth', min: 1, max: 20, label: 'Tile Width'},
			{type: 'range', variable: 'tileHeight', min: 1, max: 20, label: 'Tile Height'}
		]
	};

	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");

	this.tileWidth = 2;
	this.tileHeight = 2;

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
		console.log('init tile')
	}

	this.draw = function(canvas, ctx) {
		//newCtx2.fillStyle = '#000';
		newCtx2.clearRect(0,0,canvas.width, canvas.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newCanvas2.width, newCanvas2.height);
		for(var i=0; i < this.tileWidth; i++) {
			for(var j=0; j < this.tileHeight; j++) {
				ctx.drawImage(newCanvas2,
					0,
					0,
					newCanvas2.width,
					newCanvas2.height,
					(newCanvas2.width/this.tileWidth)*i,
					(newCanvas2.height/this.tileHeight)*j,
					newCanvas2.width/this.tileWidth,
					newCanvas2.height/this.tileHeight
				);
			}
		}
	};
};
tile = new tile();