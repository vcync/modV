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
			}

			resolve(info.program);
		});
	};
};