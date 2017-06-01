#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
#else
	precision mediump float;
#endif

uniform sampler2D u_modVCanvas;
uniform float iGlobalTime;
uniform float distortAmount;
varying vec2 vUv;

vec2 barrelDistort(vec2 pos, float power) {
	float t = atan(pos.y, pos.x);
	float r = pow(length(pos), power);
	pos.x   = r * cos(t);
	pos.y   = r * sin(t);
	return 0.5 * (pos + 1.0);
}

void main() {
	vec2 q = vUv;

	vec2 p  = -1.0 + 2.0*q;
	float d = length(p);

	float s = 1.0 - min(1.0, d*d);

	//float t = abs(iGlobalTime) / 0.5;
	float barrel_pow = 1.0 + 0.5 * (1.0 + distortAmount);
	p = barrelDistort(p, barrel_pow);

	gl_FragColor = texture2D(u_modVCanvas, s * (p-q) + q );
}