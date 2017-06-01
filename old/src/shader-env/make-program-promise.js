var compiler = require('webgl-compile-shader');

module.exports = (gl) => {
	return function makeProgram(vertexSource, fragmentSource) {

		return new Promise((resolve, reject) => {
			var info;

			try {
				info = compiler({
					vertex: vertexSource,
					fragment: fragmentSource,

					//optional args
					gl: gl, //WebGL context; if not specified a new one will be created
					verbose: true, //whether to emit console.warn messages when throwing errors
					//attributeLocations: { ... key:index pairs ... },
				});
			} catch(e) {
				reject(e);
				return;
			}

			// Set position variable
			var positionLocation = gl.getAttribLocation(info.program, "a_position");
			gl.enableVertexAttribArray(positionLocation);
			gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

			// Bind sampler location
			var samplerLocation = gl.getUniformLocation(info.program, "u_modVCanvas");
			gl.useProgram(info.program);
			gl.uniform1i(samplerLocation, 0);

			resolve(info.program);
		});
	};
};