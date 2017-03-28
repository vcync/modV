module.exports = (gl, env) => {
	let programs = env.programs;
	let setRectangle = env.setRectangle;

	return function render(delta, canvas, pixelRatio) {
		// Clear WebGL canvas
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Set delta
		var deltaLocation = gl.getUniformLocation(programs[env.activeProgram], "u_delta");
		gl.uniform1f(deltaLocation, delta);

		// TODO: setup u_time & other usual uniforms
		var timeLocation = gl.getUniformLocation(programs[env.activeProgram], "u_time");
		gl.uniform1f(timeLocation, delta);

		var timeSecondsLocation = gl.getUniformLocation(programs[env.activeProgram], "iGlobalTime");
		gl.uniform1f(timeSecondsLocation, delta / 1000);

		var resolutionLocation = gl.getUniformLocation(programs[env.activeProgram], "iResolution");
		gl.uniform3f(resolutionLocation, canvas.width, canvas.height, 1.0);

		// required as we need to resize our drawing boundaries for gallery and main canvases
		// -- potential performance hinderance, consider seperate GL environment for gallery
		setRectangle(0, 0, canvas.width, canvas.height, env.buffer);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
};