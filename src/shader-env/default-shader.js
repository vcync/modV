module.exports = {
	v: "attribute vec2 a_position,a_texCoord;" +
		"uniform vec2 u_resolution;" +
		"varying vec2 v_texCoord;" +
		"void main() {" +
			"vec2 zeroToOne=a_position/u_resolution,zeroToTwo=zeroToOne*2.,clipSpace=zeroToTwo-1.;" +
			"gl_Position=vec4(clipSpace*vec2(1,-1),0,1);" +
			"v_texCoord=a_texCoord;" +
		"}",

	f: "precision mediump float;" +
		"uniform sampler2D u_modVCanvas;" +
		"varying vec2 v_texCoord;" +
		"void main() {" +
			"gl_FragColor=texture2D(u_modVCanvas,v_texCoord);" +
		"}"
};