module.exports = (gl, canvas) => {
	
	return function resize(width, height) {
		// Set canvas width
		canvas.width = width;
		canvas.height = height;
	
		// Set viewport size from gl context
		gl.viewport(0, 0, width, height);
	};
};