var textMod = function() {

	this.info = {
		name: 'textMod',
		author: '2xAA',
		version: 0.1,
		controls: [
			{type: 'text', variable: 'text', label: 'Text'},
			{type: 'range', varType: 'int', min: 50, max: 200, variable: 'size', append: 'pt', label: 'Size'}
		]
	};

	var getTextHeight = function(font) {

		var result = {};

		var text = document.createElement('span');
			text.style.fontFamily = font;
			text.textContent = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

		var block = document.createElement('div');
			block.style.display = 'inline-block';
			block.style.width = '1px';
			block.style.height = '0px';

		var div = document.createElement('div');
			div.appendChild(text);
			div.appendChild(block);

		document.body.appendChild(div);

		block.style.verticalAlign = 'baseline';
		result.ascent = block.offsetHeight - text.offsetHeight;

		block.style.verticalAlign = 'bottom';
		result.height = block.offsetHeight - text.offsetHeight;

		result.descent = result.height - result.ascent;

		div.remove();

		return result;
	};

	var hue = 0;
	this.text = 'modV';
	this.size = '50pt';
	var font;
	var h = getTextHeight(font);

	setInterval(function() {
		h = getTextHeight(font);
	}, 1000);

	this.draw = function(canvas, ctx) {
		ctx.textBaseline = 'middle';
		font = ctx.font = this.size + ' "Helvetica", sans-serif';
		ctx.textAlign = 'left';
		ctx.fillStyle = 'hsl(' + hue + ', 100%, 50%)';

		var w = ctx.measureText(this.text).width;

		ctx.fillText(this.text, canvas.width/2 - w/2, canvas.height/2 + h.height/2);
		if(hue === 360) hue = 0;
		else hue++;
	};
};