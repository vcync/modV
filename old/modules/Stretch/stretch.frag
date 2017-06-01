precision mediump float;

varying vec2 vUv;
uniform float u_delta;
uniform sampler2D u_modVCanvas;

uniform float intensity; // 0.03
uniform float rms;

void main(void) {
	vec2 uv = vUv;

   	uv -= 0.5;

	uv.x = uv.x / (1.0 + (rms * intensity));
	uv.y = uv.y / (1.0 + (rms * intensity));

	uv += 0.5;

	gl_FragColor = texture2D(u_modVCanvas, uv);
}