const genUUID = require('./uuid.js');

let drunkenMess = function() {
	return 'You sure about that, you drunken mess?';
};

/**
 * [WindowController description]
 * @param {String}   id       - [description]
 * @param {Function} resizeCb - [description]
 * @return {Object}           - Object with Controller (the WindowController) and promise, resolving when window has been opened and configured
 */
let WindowController = function(id, resizeCb) {

		/**
		 * Set up document, style, canvas and resize event in this.window
		 * @param  {Function} callback - Function to call at the end of the configuration
		 * @return {undefined}
		 */
		this.configureWindow = function(callback) {
			this.window.document.title = 'modV Output';
			this.window.document.body.style.margin = '0px';
			this.window.document.body.style.backgroundColor = 'black';

			this.canvas = document.createElement('canvas');
			this.context = this.canvas.getContext('2d');

			this.canvas.style.position = 'fixed';

			this.canvas.style.top = this.canvas.style.bottom = this.canvas.style.left = this.canvas.style.right = 0;

			this.window.document.body.appendChild(this.canvas);

			this.resize = () => {
				this.canvas.width = this.window.innerWidth;
				this.canvas.height = this.window.innerHeight;
				this.canvas.style.width = this.window.innerWidth + 'px';
				this.canvas.style.height = this.window.innerHeight + 'px';
				if(resizeCb) resizeCb(this.window.devicePixelRatio);
			};

			this.window.addEventListener('resize', this.resize);

			if(callback) callback();
		};

		/**
		 * Get assigned ID
		 * @return {String} The ID
		 */
		this.getId = function() {
			return id;
		};

		return {
			Controller: this,
			promise: new Promise((resolve) => {
				let pWindow;
				if(!window.nw) {
					pWindow = window.open(
						'',
						'_blank',
						'width=100, height=100, location=no, menubar=no, left=0'
					);
					this.window = pWindow;
					if(this.window.document.readyState === "complete") {
						this.configureWindow(resolve);
					} else {
						this.window.onload = () => {
							this.configureWindow(resolve);
						};
					}
				} else {
					nw.Window.open('output.html', (newWindow) => {
						pWindow = newWindow.window;
						this.window = pWindow;
						if(this.window.document.readyState === "complete") {
							this.configureWindow(resolve);
						} else {
							this.window.onload = () => {
								this.configureWindow(resolve);
							};
						}
					});
				}
			})
		};
	};

	module.exports = function(modV) {

		/**
		 * Creates a new output window
		 */
		modV.prototype.createWindow = function() {

			let id = genUUID();

			// Set modV.prototype.previewWindow
			let WindowC = new WindowController(id, (dpr) => {
				this.pixelRatio = dpr;
				this.resize();
			});

			WindowC.promise.then(() => {
				let Controller = WindowC.Controller;

				Controller.window.onbeforeunload = drunkenMess;

				Controller.window.addEventListener('unload', () => {
					this.outputWindows.forEach((oWindow, idx) => {
						if(oWindow.getId() === id) {
							this.outputWindows.splice(idx, 1);
						}
					});
				});

				// Add to Output Windows Array
				this.outputWindows.push(Controller);
				this.resize();

				// OnClose
				window.addEventListener('beforeunload', () => {
					try {
						Controller.window.close();
					} catch(e) {
						// oops window not found.
					}
				}, false);
			});
		};
	};