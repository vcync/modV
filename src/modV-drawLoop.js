(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.drawFrame = function(meydaOutput, delta) {
		var self = this;
		

		if(!modV.ready) return;
		if(modV.clearing) {
			console.log('clearing');
			modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
		}
		for(var i=0; i < modV.modOrder.length; i++) {
			if(typeof modV.registeredMods[modV.modOrder[i]] === 'object') {

				if(modV.registeredMods[modV.modOrder[i]].info.disabled || modV.registeredMods[modV.modOrder[i]].info.alpha === 0) continue;
				modV.context.save();
				modV.context.globalAlpha = modV.registeredMods[modV.modOrder[i]].info.alpha;

				if(modV.registeredMods[modV.modOrder[i]].info.blend !== 'normal') modV.context.globalCompositeOperation = modV.registeredMods[modV.modOrder[i]].info.blend;

				if(!modV.registeredMods[modV.modOrder[i]].info.threejs) {

					modV.registeredMods[modV.modOrder[i]].draw(modV.canvas, modV.context, modV.amplitudeArray, modV.video, meydaOutput, delta);

				} else {

					modV.registeredMods[modV.modOrder[i]].draw(modV.canvas, modV.context, modV.amplitudeArray, modV.video, meydaOutput, delta);
					modV.context.drawImage(modV.threejs.canvas, 0, 0);
					modV.threejs.renderer.render(modV.threejs.scene, modV.threejs.camera);
				}
				modV.context.restore();
			}
		}
		if(modV.options.previewWindow) previewCtx.drawImage(modV.canvas, 0, 0, previewCanvas.width, previewCanvas.height);
	};

	modV.prototype.loop = function(timestamp) {
		var self = this;

		requestAnimationFrame(modV.loop);

		if(!modV.meydaSupport) modV.myFeatures = [];
		
		if(modV.ready) {
			
			if(modV.meydaSupport && modV.reallyReady) {
				modV.myFeatures = modV.meyda.get(modV.meydaFeatures);
				modV.beatDetektorMed.process((timestamp / 1000.0), modV.myFeatures.complexSpectrum.real);
				modV.bpm = modV.beatDetektorMed.win_bpm_int_lo;
			} else {
				modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
				modV.reallyReady = true;
			}

		} else {
			modV.context.clearRect(0, 0, modV.canvas.width, modV.canvas.height);
			var text = 'Please allow popups and share your media inputs.';
			var font = modV.context.font =  72 + 'px "Helvetica", sans-serif';
			modV.context.textAlign = 'left';
			modV.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
			var w = modV.context.measureText(text).width;

			if(!modV.options.retina) font = modV.context.font =  36 + 'px "Helvetica", sans-serif';
			w = modV.context.measureText(text).width;

			modV.context.fillText(text, modV.canvas.width/2 - w/2, modV.canvas.height/2 + 36);

			text = 'Check the docs at http://modv.readme.io/ for more info.';
			font = modV.context.font =  42 + 'px "Helvetica", sans-serif';
			modV.context.textAlign = 'left';
			modV.context.fillStyle = 'hsl(' + timestamp / 10 + ', 100%, 50%)';
			w = modV.context.measureText(text).width;

			if(!modV.options.retina) font = modV.context.font =  20 + 'px "Helvetica", sans-serif';
			w = modV.context.measureText(text).width;

			modV.context.fillText(text, modV.canvas.width/2 - w/2, modV.canvas.height/2 + 36 + 72);
		}

		modV.palettes.forEach(function(palette) {
			palette.nextStep();
		});

		modV.drawFrame(modV.myFeatures, timestamp);
	};

})(module);