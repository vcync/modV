(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.shaderSetup = function() {
		var self = this;
		
		self.shaderEnv.programs = [null]; // null at position 0 because programs can't be 0
		self.shaderEnv.gl = null;
		self.shaderEnv.canvas = null;
		self.shaderEnv.texture = null;
		self.shaderEnv.activeProgram = 1;

		var buffer;
		var gl; // reference to self.shaderEnv.gl
		var programs = self.shaderEnv.programs; // reference
		var canvas; // refrence to self.shaderEnv.gl

		function resize(programIndex) {

			var currentProgramIndex;

			if(typeof programIndex !== 'undefined') {
				currentProgramIndex = self.shaderEnv.activeProgram;
				self.shaderEnv.activeProgram = programIndex;
				gl.useProgram(programs[programIndex]);
			}

			// TODO: sort out dvp to work with 'retina' flag

			// Set canvas width
			canvas.width = window.innerWidth/* * window.devicePixelRatio*/;
			canvas.height = window.innerHeight/* * window.devicePixelRatio*/;
			
			// Set viewport size from gl context
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			
/*			// Set u_resolution
			if(programs[self.shaderEnv.activeProgram]) {
				var resolutionLocation = gl.getUniformLocation(programs[self.shaderEnv.activeProgram], "u_resolution");
				gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
				setRectangle(gl, 0, 0, canvas.width, canvas.height);
			}*/

			if(typeof programIndex !== 'undefined') {
				self.shaderEnv.activeProgram = currentProgramIndex;
				gl.useProgram(programs[currentProgramIndex]);
			}
		}

		self.shaderEnv.resize = resize;

		function setRectangle(gl, x, y, width, height) {
			var x1 = x;
			var x2 = x + width;
			var y1 = y;
			var y2 = y + height;
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
				 x1, y1,
				 x2, y1,
				 x1, y2,
				 x1, y2,
				 x2, y1,
				 x2, y2]), gl.DYNAMIC_DRAW // using dynamic draw to allow resolution updates
			);
		}

		function init() {
			self.shaderEnv.canvas	= document.createElement('canvas');
			self.shaderEnv.gl		= self.shaderEnv.canvas.getContext('experimental-webgl', {antialias: false, premultipliedAlpha: false});
			gl = self.shaderEnv.gl; // set reference
			canvas = self.shaderEnv.canvas; // set reference

			// Disable Colourspace conversion
			gl.pixelStorei(gl.UNPACK_COLORSPACE_CONVERSION_WEBGL, gl.NONE);

			// Disable pre-multiplied alpha
			gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, gl.NONE);
			
			// Compile shaders and create program
			var shaderSource;
			var vertexShader;
			var fragmentShader;

			shaderSource = "" +
				"attribute vec2 a_position,a_texCoord;" +
				"uniform vec2 u_resolution;" +
				"varying vec2 v_texCoord;" +
				"void main() {" +
					"vec2 zeroToOne=a_position/u_resolution,zeroToTwo=zeroToOne*2.,clipSpace=zeroToTwo-1.;" +
					"gl_Position=vec4(clipSpace*vec2(1,-1),0,1);" +
					"v_texCoord=a_texCoord;" +
				"}";

			vertexShader = gl.createShader(gl.VERTEX_SHADER);
			gl.shaderSource(vertexShader, shaderSource);
			gl.compileShader(vertexShader);

			shaderSource = "" +
				"precision mediump float;" +
				"uniform sampler2D u_modVCanvas;" +
				"varying vec2 v_texCoord;" +
				"void main() {" +
					"gl_FragColor=texture2D(u_modVCanvas,v_texCoord);" +
				"}";

			fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
			gl.shaderSource(fragmentShader, shaderSource);
			gl.compileShader(fragmentShader);

			programs.push(gl.createProgram());

			gl.attachShader(programs[self.shaderEnv.activeProgram], vertexShader);
			gl.attachShader(programs[self.shaderEnv.activeProgram], fragmentShader);
			gl.linkProgram(programs[self.shaderEnv.activeProgram]);	
			gl.useProgram(programs[self.shaderEnv.activeProgram]);

			// look up where the texture coordinates need to go.
			var texCoordLocation = gl.getAttribLocation(programs[self.shaderEnv.activeProgram], "a_texCoord");
			
			// provide texture coordinates for the rectangle.
			var texCoordBuffer = gl.createBuffer();
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
			self.shaderEnv.texture = gl.createTexture();
			gl.activeTexture(gl.TEXTURE0); // At Unit position 0
			gl.bindTexture(gl.TEXTURE_2D, self.shaderEnv.texture);
			
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
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // or NEAREST
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); // or NEAREST

			// Set canvas and viewport sizes
			resize();

			// Get position of position attribute
			var positionLocation = gl.getAttribLocation(programs[self.shaderEnv.activeProgram], "a_position");

			// Create a buffer for the position of the rectangle corners.
			buffer = gl.createBuffer();
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.enableVertexAttribArray(positionLocation);
			gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

			// Create modVCanvas sampler2D Uniform
			var samplerLocation = gl.getUniformLocation(programs[self.shaderEnv.activeProgram], "u_modVCanvas");
			gl.uniform1i(samplerLocation, 0); // Unit position 0

			// Set Rectangle again because of the buffer creation
			setRectangle(
				gl,
				0,
				0,
				window.innerWidth/* * window.devicePixelRatio*/,
				window.innerHeight/* * window.devicePixelRatio*/
			);

			// render(); // always loop - this is pretty efficient so we don't really need to worry about it going forever (hopefully, heh)
			window.addEventListener('resize', resize);
		}

		function render(delta, canvas) {
			// window.requestAnimationFrame(render);

			// Clear WebGL canvas
			gl.clearColor(0.0, 0.0, 0.0, 0.0);
			gl.clear(gl.COLOR_BUFFER_BIT);
			
			// Set position variable
			var positionLocation = gl.getAttribLocation(programs[self.shaderEnv.activeProgram], "a_position");
			gl.enableVertexAttribArray(positionLocation);
			gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
			
			// Set delta
			var deltaLocation = gl.getUniformLocation(programs[self.shaderEnv.activeProgram], "u_delta");
			gl.uniform1f(deltaLocation, delta);

			// Update texture???
			var samplerLocation = gl.getUniformLocation(programs[self.shaderEnv.activeProgram], "u_modVCanvas");
			gl.uniform1i(samplerLocation, 0); // Unit position 0

			// TODO: setup u_time & other usual uniforms
			var timeLocation = gl.getUniformLocation(programs[self.shaderEnv.activeProgram], "u_time");
			gl.uniform1f(timeLocation, delta);

			// Set u_resolution
			if(programs[self.shaderEnv.activeProgram]) {
				var resolutionLocation = gl.getUniformLocation(programs[self.shaderEnv.activeProgram], "u_resolution");
				gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
				setRectangle(gl, 0, 0, canvas.width, canvas.height);
			}

			gl.drawArrays(gl.TRIANGLES, 0, 6);
		}

		self.shaderEnv.render = render;

		init();
	};
})();