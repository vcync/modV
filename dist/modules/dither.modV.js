var dither = function() {
	this.info = {
		name: 'dither',
		author: '2xAA',
		version: 0.1
	};

	function ditherImageData4x4(imageDataToDither, depth) {
		var threshold_map = [
			[  1,  9,  3, 11 ],
			[ 13,  5, 15,  7 ],
			[  4, 12,  2, 10 ],
			[ 16,  8, 14,  6 ]
		];

		var dataWidth  = imageDataToDither.width;
		var dataHeight = imageDataToDither.height;
		var pixel  = imageDataToDither.data;
		var x, y, a, b;
		for ( x=0; x<dataWidth; x++ ){
			for ( y=0; y<dataHeight; y++ ){
				a = ( x * dataHeight + y ) * 4;
				b = threshold_map[ x%4 ][ y%4 ];
				pixel[ a + 0 ] = ( (pixel[ a + 0 ]+ b) / depth | 0 ) * depth;
				pixel[ a + 1 ] = ( (pixel[ a + 1 ]+ b) / depth | 0 ) * depth;
				pixel[ a + 2 ] = ( (pixel[ a + 2 ]+ b) / depth | 0 ) * depth;
				//pixel[ a + 3 ] = ( (pixel[ a + 3 ]+ b) / depth | 3 ) * depth;
			}
		}
		return pixel;
	};
	
	var tempCanvas = document.createElement('canvas');
	tempCtx = tempCanvas.getContext('2d');
	
	this.init = function(canvas) {
		tempCanvas.width = canvas.width;
		tempCanvas.height = canvas.height;
	}
	
	this.depth = 48;

	this.draw = function(canvas, ctx) {
		var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		imageData.data = ditherImageData4x4(imageData, this.depth);
		tempCtx.putImageData(imageData, 0, 0);
		ctx.drawImage(tempCanvas, 0, 0);
	};
};