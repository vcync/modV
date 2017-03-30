module.exports = function(modV) {

	modV.prototype.createGalleryItem = function(oldModule) {

		if(
			!(oldModule instanceof this.Module2D) &&
			!(oldModule instanceof this.ModuleShader) &&
			!(oldModule instanceof this.Module3D) &&
			!(oldModule instanceof this.ModuleScript)
		) return;

		let template = this.templates.querySelector('#gallery-item');
		let galleryItem = document.importNode(template.content, true);

		let previewCanvas = galleryItem.querySelector('canvas');

		// Module variables
		let previewCtx = previewCanvas.getContext('2d');

		// Clone module
		let Module = this.createModule(oldModule, previewCanvas, previewCtx, true);

		// Setup any preview settings for gallery item
		if('previewValues' in Module.info) {
			forIn(Module.info.previewValues, (key, value) => {
				Module[key] = value;
			});
		}

		document.querySelector('.gallery').appendChild(galleryItem);

		// Tell the Module it is in the gallery
		Module.info.galleryItem = true;

		// Pull back initialised node from DOM
		galleryItem = document.querySelector('.gallery .gallery-item:last-child');
		let galleryItemTitle = galleryItem.querySelector('span.title');
		galleryItemTitle.textContent = Module.info.name;

		// Set data
		galleryItem.dataset.moduleName = Module.info.name.replace(' ', '-');

		previewCanvas.addEventListener('mouseenter', () => {
			mouseOver = true;
			activeVariables = [Module, previewCanvas, previewCtx];
			raf = requestAnimationFrame(loop.bind(this));
		});

		previewCanvas.addEventListener('mouseout', function() {
			cancelAnimationFrame(raf);
			mouseOver = false;
			activeVariables = [];
		});

	};

	let mouseOver = false;
	let raf = null;
	let activeVariables = [];

	function loop(delta) {

		if(mouseOver) raf = requestAnimationFrame(loop.bind(this));
		else cancelAnimationFrame(raf);

		let Module = activeVariables[0],
			canvas = activeVariables[1],
			ctx = activeVariables[2];

		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if(Module.info.previewWithOutput || Module instanceof this.ModuleShader) {
			ctx.drawImage(this.outputCanvas, 0, 0, canvas.width, canvas.height);
		}

		if(Module instanceof this.ModuleShader) {

			let _gl = this.shaderEnv.gl;

			// Switch program
			if(Module.programIndex !== this.shaderEnv.activeProgram) {

				this.shaderEnv.activeProgram = Module.programIndex;

				_gl.useProgram(this.shaderEnv.programs[Module.programIndex]);
			}

			// Copy Main Canvas to Shader Canvas
			this.shaderEnv.texture = _gl.texImage2D(
				this.shaderEnv.gl.TEXTURE_2D,
				0,
				_gl.RGBA,
				_gl.RGBA,
				_gl.UNSIGNED_BYTE,
				this.outputCanvas
			);

			// Render
			this.shaderEnv.render(delta, canvas, window.devicePixelRatio, Module);

			// Copy Shader Canvas to Main Canvas
			ctx.drawImage(
				this.shaderEnv.canvas,
				0,
				0,
				canvas.width,
				canvas.height
			);

		} else if('draw' in Module) {
			ctx.save();
			Module.draw(canvas, ctx, this.videoStream, this.activeFeatures, this.meyda, delta, this.bpm, this.kick);
			ctx.restore();
		}
	}
};