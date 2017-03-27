module.exports = {
	v:  "precision mediump float;" +
		"attribute vec2 a_position,a_texCoord;" +
		"uniform vec3 iResolution;" +
		"varying vec2 fragCoord;" +
		"varying vec2 vUv;" +
		"void main() {" +
			"vec2 zeroToOne=a_position/iResolution.xy,zeroToTwo=zeroToOne*2.,clipSpace=zeroToTwo-1.;" +
			"gl_Position=vec4(clipSpace*vec2(1,-1),0,1);" +
			"fragCoord=a_position;" +
			"vUv=zeroToOne;" +
		"}",

	f:  "precision mediump float;" +
		"uniform sampler2D u_modVCanvas;" +
		"uniform vec3 iResolution;" +
		"uniform float iGlobalTime;" +
		"varying vec2 vUv;" +
		"void main() {" +
			"gl_FragColor=vec4(vUv.x,0.5+0.5*cos(iGlobalTime/1.1),0.5+0.5*sin(iGlobalTime),1.0);" +
		"}",

	fWrap:	"precision mediump float;" +
			"uniform sampler2D u_modVCanvas;" +
			"uniform vec3 iResolution;" +
			"uniform float iGlobalTime;" +
			"varying vec2 fragCoord;" +
			"%MAIN_IMAGE_INJECT%" +
			"void main() {" +
				"gl_FragColor=mainImage(fragCoord);" +
			"}",
};