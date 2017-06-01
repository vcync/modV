precision mediump float;

uniform sampler2D u_modVCanvas;
varying vec2 vUv;
uniform float amount;
uniform float centerX;
uniform float centerY;
uniform float spread;

void main() {
	vec2 uv = vUv.xy;

	// normalize to the center
	uv.x = uv.x - centerX;
	uv.y = uv.y - centerY;

	// cartesian to polar coordinates
	float r = length(uv);
	float a = atan(uv.y, uv.x);

	// distort
	r = tan((r * spread) / amount); // pinch

	// polar to cartesian coordinates
	uv = r * vec2(cos(a), sin(a));

	uv.x = uv.x + centerX;
	uv.y = uv.y + centerY;

	vec4 c = texture2D(u_modVCanvas, uv);
	gl_FragColor = c;
}