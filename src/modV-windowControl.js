const genUUID = require('./uuid.js');

let drunkenMess = function() {
	return 'You sure about that, you drunken mess?';
};

let WindowController = function(id, resizeCb) {
	let pWindow = window.open('', '_blank', 'width=1, height=1, location=no, menubar=no, left=0');

	pWindow.document.title = 'modV Output';

	pWindow.document.body.style.margin = '0px';
	pWindow.document.body.style.backgroundColor = 'black';
	
	this.canvas = document.createElement('canvas');
	this.context = this.canvas.getContext('2d');

	this.canvas.style.position = 'fixed';
	
	this.canvas.style.top = this.canvas.style.bottom = this.canvas.style.left = this.canvas.style.right = 0;

	pWindow.document.body.appendChild(this.canvas);

	this.resize = () => {
		this.canvas.width = pWindow.innerWidth;
		this.canvas.height = pWindow.innerHeight;
		this.canvas.style.width = pWindow.innerWidth + 'px';
		this.canvas.style.height = pWindow.innerHeight + 'px';
		if(resizeCb) resizeCb();
	};

	pWindow.addEventListener('resize', this.resize);

	this.getId = function() {
		return id;
	};

	this.window = pWindow;
};

module.exports = function(modV) {

	modV.prototype.createWindow = function() {

		let id = genUUID();

		// Set modV.prototype.previewWindow
		let WindowC = new WindowController(id, () => {
			this.resize();
		});

		WindowC.window.onbeforeunload = drunkenMess;

		WindowC.window.addEventListener('unload', () => {
			this.outputWindows.forEach((oWindow, idx) => {
				if(oWindow.getId() === id) {
					this.outputWindows.splice(idx, 1);
				}
			});
		});

		// Add to Output Windows Array
		this.outputWindows.push(WindowC);

		// OnClose
		window.addEventListener('beforeunload', () => {
			try {
				WindowC.window.close();
			} catch(e) {
				// oops window not found.
			}
		}, false);
	};
};