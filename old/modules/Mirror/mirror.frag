precision mediump float;
uniform sampler2D u_modVCanvas;
uniform float u_midPosition;
varying vec2 vUv;

void main() {
	vec2 uv2 = vUv;
	uv2.x = 1.0-uv2.x;

	if(vUv.x > u_midPosition) {
		gl_FragColor = texture2D(u_modVCanvas, uv2);
	} else {
		gl_FragColor = texture2D(u_modVCanvas, vUv);
	}
}