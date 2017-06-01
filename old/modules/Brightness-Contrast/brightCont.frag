precision mediump float;

varying vec2 vUv;
uniform sampler2D u_modVCanvas;

uniform float brightness;
uniform float contrast;

void main() {
	vec3 color = texture2D(u_modVCanvas, vUv).rgb;
	vec3 colorContrasted = (color) * contrast;
	vec3 bright = colorContrasted + vec3(brightness,brightness,brightness);
	gl_FragColor = vec4(bright, 1);
}