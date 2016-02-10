(function(bModule) {
	'use strict';
	/*jslint browser: true */

	// from here: http://stackoverflow.com/a/728400
	// function clone(obj) {
	// 	if(obj === null || typeof(obj) != 'object')
	// 		return obj;	
	// 	var temp = new obj.constructor();
	// 	for(var key in obj) {

	// 		try {
	// 			temp[key] = clone(obj[key]);
	// 		} catch(e) {

	// 		}

	// 	}
	// 	return temp;
	// }

	modV.prototype.createGalleryItem = function(Module) {
		var self = this;

		if(!(Module instanceof self.Module2D)) return;

		// Clone module -- afaik, there is no better way than this
		Module = self.cloneModule(Module, true);
		console.log(Module);

		//Module = new Module();

		self.galleryModules = [];
		
		var template = self.templates.querySelector('#gallery-item');
		var galleryItem = document.importNode(template.content, true);

		var previewCanvas = galleryItem.querySelector('canvas');
		var titleElement = galleryItem.querySelector('span.title');

		// Module variables
		var previewCtx = previewCanvas.getContext('2d'),
			name = Module.info.name,
			type;

		if(Module instanceof self.ModuleShader) {
			type = 'ModuleShader';
		} else if(Module instanceof self.Module2D) {
			type = 'Module2D';
		}

		// init cloned Module
		if('init' in Module) {
			console.log(name);
			Module.init(previewCanvas, previewCtx);
		}

		var interval;

		document.querySelector('.gallery').appendChild(galleryItem);

		document.querySelector('.gallery .gallery-item:last-child');

		

		previewCanvas.addEventListener('mouseenter', function() {
			var loop = giMouseEnter(Module, type, previewCanvas, previewCtx, self);
			interval = setInterval(loop, 1000/60);
		});

		previewCanvas.addEventListener('mouseout', function() {
			giMouseOut(interval);
		});

/*		previewCanvas.addEventListener('mousemove', function(evt) {
			mousePos = getMousePos(previewCanvas, evt, true);
	   	}, false);*/

	};

	var mousePos = {x: 0, y: 0};

	function giMouseEnter(Module, type, canvas, ctx, self) {

		console.log('mouse enter');

		return function(delta) {
			//ctx.clearRect(0, 0, mousePos.x, canvas.height);
			//ctx.clearRect(0, 0, Math.round(canvas.width/2), canvas.height);
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			var positionInfo = canvas.getBoundingClientRect();

			var largeWidth = Math.round(Math.map(mousePos.x, 0, positionInfo.width, 0, self.canvas.width));
			console.log(mousePos.x, positionInfo.width, largeWidth, self.canvas.width);

			//ctx.drawImage(self.canvas, largeWidth, 0, self.canvas.width, self.canvas.height, mousePos.x, 0, canvas.width, canvas.height);
			//ctx.drawImage(self.canvas, Math.round(self.canvas.width/2), 0, self.canvas.width, self.canvas.height, Math.round(canvas.width/2), 0, canvas.width, canvas.height);

			Module.draw(canvas, ctx, self.video, self.myFeatures, self.meyda, delta, self.bpm);
		};

	}

	function giMouseOut(interval) {
		clearInterval(interval);
		return undefined;
	}

	function getMousePos(canvas, evt, round) {
		var rect = canvas.getBoundingClientRect();
		if(round) {
			return {
				x: Math.floor(evt.clientX - rect.left),
				y: Math.floor(evt.clientY - rect.top)
			};
		} else {
			return {
				x: evt.clientX - rect.left,
				y: evt.clientY - rect.top
			};
		}
	}

})(module);