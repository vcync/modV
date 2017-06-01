const twgl = require('twgl.js');

module.exports = (gl, env) => {
	let setRectangle = env.setRectangle;

	return function render(delta, canvas, pixelRatio, Module) {
		// Clear WebGL canvas
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		let programIndex = Module.programIndex;
		let programInfo = Module.programInfo;

		let uniforms = {
			iGlobalTime: delta / 1000,
			iDelta: delta,
			u_delta: delta,
			u_time: delta,
			iResolution: [canvas.width, canvas.height, pixelRatio || 1.0]
		};

		for(var [key, value] of Module.uniformValues.entries()) {
			uniforms[key] = value;
		}

		env.setActiveProgramFromIndex(programIndex);
		twgl.setUniforms(programInfo, uniforms);

		// required as we need to resize our drawing boundaries for gallery and main canvases
		// TODO: this is a performance hinderance, the most expensive call within this function,
		// consider seperate GL environment for gallery
		//setRectangle(0, 0, canvas.width, canvas.height, env.buffer);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
};