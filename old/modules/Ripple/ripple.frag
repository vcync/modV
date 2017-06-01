precision mediump float;

varying vec2 vUv;
uniform float u_delta;
uniform sampler2D u_modVCanvas;

uniform float time; // 100.0
uniform float intensity; // 0.03
uniform float ripples; // 12.0

void main(void) {
	vec2 cPos = vUv;
	cPos.x = cPos.x - 0.5;
	cPos.y = cPos.y - 0.5;

	float cLength = length(cPos);

	vec2 uv = vUv + (cPos/cLength) * cos((cLength * ripples) - (u_delta / time)) * intensity;
	vec4 col = texture2D(u_modVCanvas, uv);

	gl_FragColor = col;
}