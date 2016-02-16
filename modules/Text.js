var Text = new modVC.Module2D({
	info: {
		name: 'Text',
		author: '2xAA',
		version: 0.1,
		controls: []
	},
	init: function(canvas) {
 		var that = this;
		this.hue = 0;
		this.text = 'modV';
		this.size = '50pt';
		this.font = this.size + ' "Helvetica", sans-serif';
		this.h = 0;

		setInterval(function() {
			that.h = that.getTextHeight(that.font);
		}, 1000);
		
	},
	draw: function(canvas, ctx, vid, features, meyda, delta, bpm) {

		ctx.textBaseline = 'middle';
		this.font = ctx.font = this.size + ' "Helvetica", sans-serif';
		ctx.textAlign = 'left';
		ctx.fillStyle = 'hsl(' + this.hue + ', 100%, 50%)';

		var w = ctx.measureText(this.text).width;

		ctx.fillText(this.text, canvas.width/2 - w/2, canvas.height/2 + this.h.height/2);
		if(this.hue === 360) this.hue = 0;
		else this.hue++;

	}
});

Text.getTextHeight = function(font) {

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

var controls = [];

controls.push(new modVC.TextControl({
    variable: 'text',
    label: 'Text',
    default: 'modV'
}));

controls.push(new modVC.RangeControl({
    variable: 'size',
    label: 'Size',
    append: 'pt',
    min: 50,
    max: 200,
    default: 50
}));

Text.add(controls);

modVC.register(Text);