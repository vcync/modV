precision mediump float;

varying vec2 vUv;
uniform sampler2D u_modVCanvas;
uniform float angle;

void main() {
	float rot = radians(angle);
	vec2 uv = vUv;

	uv-=.5;

	mat2 m = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
	uv  = m * uv;

	uv+=.5;

	gl_FragColor = texture2D(u_modVCanvas, uv);
}