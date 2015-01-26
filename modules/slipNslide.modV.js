var slipNslide = function() {

	this.info = {
		name: 'slipNslide',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'range', variable: 'sections', label: 'Sections', min: 0, max: 100, varType: 'int', step: 1}
		]		
	};
	
	var newCanvas2 = document.createElement('canvas');
	var newCtx2 = newCanvas2.getContext("2d");
	
	this.sections = 50;

	this.init = function(canvas) {
		newCanvas2.width = canvas.width;
		newCanvas2.height = canvas.height;
	}
	
	var t=0;

	this.draw = function(canvas, ctx) {		
		newCtx2.clearRect(0, 0, canvas.width, canvas.height);
		newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, newCanvas2.width, newCanvas2.height);
		
		for(var i=0; i < canvas.height; i+= Math.floor(canvas.height/this.sections)) {
			ctx.drawImage(newCanvas2, Math.sin(t+i)*i, i, canvas.width, this.sections, 0, i, canvas.width, canvas.height);
		}
		
		if(t < 360) t+=0.01;
		else t = 0;
	};
};