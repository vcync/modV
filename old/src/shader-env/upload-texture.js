module.exports = (gl, env) => {
	return function uploadTexture(texture) {

		// Copy Main Canvas to Shader texture
		env.texture = gl.texImage2D(
			gl.TEXTURE_2D,
			0,
			gl.RGBA,
			gl.RGBA,
			gl.UNSIGNED_BYTE,
			texture
		);
		if(env.useMipmap) gl.generateMipmap(gl.TEXTURE_2D);
	};
};