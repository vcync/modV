module.exports = (gl, env) => {
	let programs = env.programs;
	let setRectangle = env.setRectangle;

	return function render(delta, canvas) {
		// Clear WebGL canvas
		gl.clearColor(0.0, 0.0, 0.0, 0.0);
		gl.clear(gl.COLOR_BUFFER_BIT);

		// Set position variable
		var positionLocation = gl.getAttribLocation(programs[env.activeProgram], "a_position");
		gl.enableVertexAttribArray(positionLocation);
		gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

		// Set delta
		var deltaLocation = gl.getUniformLocation(programs[env.activeProgram], "u_delta");
		gl.uniform1f(deltaLocation, delta);

		// Update texture???
		var samplerLocation = gl.getUniformLocation(programs[env.activeProgram], "u_modVCanvas");
		gl.uniform1i(samplerLocation, 0); // Unit position 0

		// TODO: setup u_time & other usual uniforms
		var timeLocation = gl.getUniformLocation(programs[env.activeProgram], "u_time");
		gl.uniform1f(timeLocation, delta);

		var timeSecondsLocation = gl.getUniformLocation(programs[env.activeProgram], "u_timeSeconds");
		gl.uniform1f(timeSecondsLocation, delta / 1000);

		var resolutionLocation = gl.getUniformLocation(programs[env.activeProgram], "u_resolution");
		gl.uniform2f(resolutionLocation, canvas.width, canvas.height);

		// Set u_resolution
		if(programs[env.activeProgram]) {
			setRectangle(0, 0, canvas.width, canvas.height, env.buffer);
		}

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};
};