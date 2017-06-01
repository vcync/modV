precision mediump float;
uniform sampler2D u_modVCanvas;
uniform float sides;
varying vec2 vUv;

void main() {

	vec2 uv = vUv.xy;

	// normalize to the center
	uv = uv - 0.5;

	// cartesian to polar coordinates
	float r = length(uv);
	float a = atan(uv.y, uv.x);

	// kaleidoscope
	//float sides = 5.;
	float tau = 2. * 3.1416;
	a = mod(a, tau/sides);
	a = abs(a - tau/sides/2.);

	// polar to cartesian coordinates
	uv = r * vec2(cos(a), sin(a));

	// recenter
	uv = uv + 0.5;

	vec4 c = texture2D(u_modVCanvas, uv);
	gl_FragColor = c;
}