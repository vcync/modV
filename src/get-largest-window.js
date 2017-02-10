module.exports = function getLargestWindow() {
	
	// TODO

	let largestWindow = this.outputWindows[0];

	let width = 0;
	let height = 0;

	this.outputWindows.forEach(oWindow => {
		if(oWindow.window.innerWidth > width || oWindow.window.innerHeight > height) {
			width = oWindow.window.innerWidth;
			height = oWindow.window.innerHeight;
			largestWindow = oWindow;
		}
	});

	return largestWindow;
};