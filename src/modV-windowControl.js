(function() {
	'use strict';
	/*jslint browser: true */

	var drunkenMess = function() {
		return 'You sure about that, you drunken mess?';
	};
	window.onbeforeunload = drunkenMess;

	// Creates Preview Window
	// > must be bound to modV's scope
	var createPreviewWindow = function() {
		var self = this;

		// TODO: bind this window's resize to the spect ratio of the main window
		// http://jsfiddle.net/yUenJ/
		// http://stackoverflow.com/a/5664172/1539303

		var pWindow = window.open('', '_blank', 'width=1, height=1, location=no, menubar=no, left=0');
		var pCanvas = document.createElement('canvas');
		var pCtx = pCanvas.getContext('2d');

		// Solo canvas
		var sCanvas = document.createElement('canvas');
		var sCtx = sCanvas.getContext('2d');
		
		pWindow.document.body.style.margin = '0px';
		pWindow.document.body.style.backgroundColor = 'black';
		pCanvas.style.position = 'fixed';
		
		pCanvas.style.top = pCanvas.style.bottom = pCanvas.style.left = pCanvas.style.right = 0;

		sCanvas.style.position = 'fixed';
		sCanvas.style.top = sCanvas.style.bottom = sCanvas.style.left = sCanvas.style.right = 0;

		pWindow.onbeforeunload = drunkenMess;

		pWindow.addEventListener('resize', function() {

			if(window.devicePixelRatio > 1 && self.options.retina) {
				pCanvas.width = pWindow.innerWidth * pWindow.devicePixelRatio;
				pCanvas.height = pWindow.innerHeight * pWindow.devicePixelRatio;
				sCanvas.width = pWindow.innerWidth * pWindow.devicePixelRatio;
				sCanvas.height = pWindow.innerHeight * pWindow.devicePixelRatio;

			} else {
				pCanvas.width = pWindow.innerWidth;
				pCanvas.height = pWindow.innerHeight;
				sCanvas.width = pWindow.innerWidth;
				sCanvas.height = pWindow.innerHeight;

			}
			pCanvas.style.width = pWindow.innerWidth + 'px';
			pCanvas.style.height = pWindow.innerHeight + 'px';
			sCanvas.style.width = pWindow.innerWidth + 'px';
			sCanvas.style.height = pWindow.innerHeight + 'px';

			self.resize();

		});

		//resizeEnd();

		pWindow.document.body.appendChild(pCanvas);
		pWindow.document.body.appendChild(sCanvas);

		return [pWindow, pCanvas, pCtx, sCanvas, sCtx];
	};

	modV.prototype.createWindows = function() {
		var self = this;

		// Set modV.prototype.previewWindow
		var pWindow = createPreviewWindow.bind(self);
		var pOutput = pWindow();
		self.previewWindow 	= pOutput[0];
		self.previewCanvas 	= pOutput[1];
		self.previewCtx 	= pOutput[2];
		self.soloCanvas 	= pOutput[3];
		self.soloCtx 		= pOutput[4];

		// OnClose
		window.addEventListener('beforeunload', function() {
			try {
				self.previewWindow.close();
			} catch(e) {
				// oops window not found.
			}
		}, false);
	};

})(module);