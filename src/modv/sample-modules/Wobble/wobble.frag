/* spec: webgl */
// from here: https://getmosh.io/

precision mediump float;

uniform sampler2D u_modVCanvas;
uniform float iGlobalTime;
uniform float strength;
uniform float size;
float speed = 1.0;
varying vec2 vUv;

void main() {
	vec2 p = -1.0 + 2.0 * vUv;
	gl_FragColor = texture2D(
		u_modVCanvas,
		vUv + strength * vec2(
			cos(iGlobalTime * speed + length(p * size)),
			sin(iGlobalTime * speed + length(p * size))
		)
	);
}