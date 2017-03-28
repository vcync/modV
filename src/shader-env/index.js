const defaultShader = require('./default-shader');

module.exports = function shaderEnvInit(modV) {

	let gl;

	let env = {};
	env.programs = [null]; // null at position 0 because programs can't be 0
	env.texture = null;
	env.activeProgram = -1;
	env.buffer = null;

	env.canvas	= document.createElement('canvas');
	env.gl		= env.canvas.getContext('webgl2', {
		//antialias: false,
		premultipliedAlpha: false
	});

	gl = env.gl;

	// Disable Colourspace conversion
	gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

	// Disable pre-multiplied alpha
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl.NONE);

	// Now we have GL, require

	const resize = require('./resize')(gl, env.canvas);
	env.makeProgram = require('./make-program')(gl);
	env.setRectangle = require('./set-rectangle')(gl);
	env.render = require('./render')(gl, env);

	// Make basic shader program
	Object.defineProperty(env, 'defaultShader', {
		get: () => {
			return defaultShader;
		}
	});

	let program = env.makeProgram(defaultShader.v, defaultShader.f);

	env.programs.push(program);
	gl.useProgram(env.programs[1]);

	// Look up where the texture coordinates need to go.
	let texCoordLocation = gl.getAttribLocation(env.programs[1], "a_texCoord");

	// provide texture coordinates for the rectangle.
	let texCoordBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
			0.0,	0.0,
			1.0,	0.0,
			0.0,	1.0,
			0.0,	1.0,
			1.0,	0.0,
			1.0,	1.0
		]),
		gl.STATIC_DRAW
	);
	gl.enableVertexAttribArray(texCoordLocation);
	gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

	// Create a texture.
	env.texture = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0); // At Unit position 0
	gl.bindTexture(gl.TEXTURE_2D, env.texture);

	// Fill the texture with a 1x1 transparent pixel.
	gl.texImage2D(
		gl.TEXTURE_2D,
		0,
		gl.RGBA,
		1,
		1,
		0,
		gl.RGBA,
		gl.UNSIGNED_BYTE,
		new Uint8Array([0, 0, 0, 0])
	);

	// Set the parameters so we can render any size image.
	// TODO: WebGL2 should be able to support NPOT textures, yet it still errors on NPOT textues...
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	// Set canvas and viewport sizes
	resize(modV.width, modV.height);

	// Get position of position attribute
	var positionLocation = gl.getAttribLocation(env.programs[1], "a_position");

	// Create a buffer for the position of the rectangle corners.
	env.buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, env.buffer);
	gl.enableVertexAttribArray(positionLocation);
	gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

	env.setRectangle(0, 0, modV.width, modV.height, env.buffer);

	env.resize = (width, height) => {
		resize(width, height);
		//env.setRectangle(0, 0, width, height, env.buffer);
	};

	env.resize(modV.width, modV.height);

	return env;
};