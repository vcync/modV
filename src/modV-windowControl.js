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

		var pWindow = window.open('', '_blank', 'width=1, height=1, location=no, menubar=no, left=0');
		
		var canvas = this.outputCanvas;

		pWindow.document.body.style.margin = '0px';
		pWindow.document.body.style.backgroundColor = 'black';
		canvas.style.position = 'fixed';
		
		canvas.style.top = canvas.style.bottom = canvas.style.left = canvas.style.right = 0;

		pWindow.onbeforeunload = drunkenMess;

		pWindow.addEventListener('resize', function() {

			canvas.style.width = pWindow.innerWidth + 'px';
			canvas.style.height = pWindow.innerHeight + 'px';

			self.resize();

		});

		pWindow.document.body.appendChild(canvas);

		return pWindow;
	};

	modV.prototype.createWindows = function() {
		var self = this;

		// Set modV.prototype.previewWindow
		var pWindow = createPreviewWindow.bind(self);
		self.previewWindow 	= pWindow();

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