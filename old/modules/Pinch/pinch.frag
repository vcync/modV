precision mediump float;
uniform sampler2D u_image;
uniform float amount;
uniform float centerX;
uniform float centerY;
varying vec2 vUv;

void main() {

	vec2 uv = vUv.xy;

	// normalize to the center
	uv.x = uv.x - centerX;
	uv.y = uv.y - centerY;

	// cartesian to polar coordinates
	float r = length(uv);
	float a = atan(uv.y, uv.x);

	// distort
	r = sqrt(r/amount); // pinch

	// polar to cartesian coordinates
	uv = r * vec2(cos(a), sin(a));

	uv.x = uv.x + centerX;
	uv.y = uv.y + centerY;

	vec4 c = texture2D(u_image, uv);
	gl_FragColor = c;
}