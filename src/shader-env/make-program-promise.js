module.exports = (gl) => {
	return function makeProgram(vertexSource, fragmentSource) {

		return new Promise((resolve, reject) => {

			let vertexShader = gl.createShader(gl.VERTEX_SHADER);
			let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			let program = gl.createProgram();

			gl.shaderSource(vertexShader, vertexSource);
			gl.compileShader(vertexShader);
			
			let vsCompiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);

			if(!vsCompiled) {
				let vsCompilationLog = gl.getShaderInfoLog(vertexShader);
				reject({
					reason: 'Vertex shader did not compile',
					log: vsCompilationLog
				});
			}

			gl.shaderSource(fragmentShader, fragmentSource);
			gl.compileShader(fragmentShader);

			let fsCompiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);

			if(!fsCompiled) {
				let fsCompilationLog = gl.getShaderInfoLog(fragmentShader);
				reject({
					reason: 'Fragment shader did not compile',
					log: fsCompilationLog
				});
			}

			gl.attachShader(program, vertexShader);
			gl.attachShader(program, fragmentShader);

			gl.linkProgram(program);

			if(gl.getProgramInfoLog(program) !== '') {
				reject({
					reason: 'Program not valid',
					log: gl.getProgramInfoLog(program)
				});
			}

			resolve(program);
		});
	};
};