class Text extends modV.Module2D {

	constructor() {
		super({
			info: {
				name: 'Text',
				author: '2xAA',
				version: 2.0
			}
		});

		var controls = [];

		controls.push(new modV.TextControl({
			variable: 'text',
			label: 'Text',
			default: 'modV'
		}));

		controls.push(new modV.RangeControl({
			variable: 'size',
			label: 'Size',
			append: 'pt',
			varType: 'int',
			min: 50,
			max: 200,
			default: 50
		}));

		controls.push(new modV.PaletteControl({
			variable: 'colour',
			colors: [
				[199,64,163],
				[97,214,199],
				[222,60,75],
				[101,151,220],
				[213,158,151],
				[100,132,129],
				[154,94,218],
				[194,211,205],
				[201,107,152],
				[119,98,169],
				[214,175,208],
				[218,57,123],
				[196,96,98],
				[218,74,219],
				[138,100,121],
				[96,118,225],
				[132,195,223],
				[82,127,162],
				[209,121,211],
				[181,152,220]
			], // generated here: http://tools.medialab.sciences-po.fr/iwanthue/
			timePeriod: 16
		}));

		this.add(controls);
	}

	
	init() {
		this.colour = 'pink';
		this.text = 'modV';
		this.size = '50pt';
		this.font = this.size + ' "Helvetica", sans-serif';
		this.h = {};

		setInterval(() => {
			this.h = this.getTextHeight(this.font);
		}, 1000);
		
	}

	draw(canvas, ctx) {
		ctx.textBaseline = 'middle';
		this.font = ctx.font = this.size + ' "Helvetica", sans-serif';
		ctx.textAlign = 'left';
		ctx.fillStyle = this.colour;

		//var w = ctx.measureText(this.text).width;

		//ctx.fillText(this.text, canvas.width/2 - w/2, canvas.height/2 + this.h.height/2);

		awesomeText(ctx, this.text, 200/2, canvas.height/2, Math.abs(this.h.height), canvas.width - 200);
	}

	getTextHeight(font) {

		var result = {};

		var text = document.createElement('span');
			text.style.font = font;
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
	}
}

modV.register(Text);