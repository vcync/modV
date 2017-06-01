precision mediump float;
uniform sampler2D u_modVCanvas;
uniform float u_delta;
uniform bool red;
uniform bool green;
uniform bool blue;
varying vec2 vUv;

void main() {
	vec2 uv = vUv;

	vec2 rUV = vec2(uv.x + (sin(u_delta/600.0)) / 4.0, uv.y + (cos(u_delta/600.0)) / 4.0);
   	vec2 bUV = vec2(uv.x + (sin(u_delta/500.0)) / 4.0, uv.y - (cos(u_delta/500.0)) / 4.0);
   	vec2 gUV = vec2(uv.x + (sin(u_delta/500.0)) / 4.0, uv.y - (cos(u_delta/800.0)) / 4.0);

	vec4 rValue = texture2D(u_modVCanvas, rUV);
	vec4 bValue = texture2D(u_modVCanvas, bUV);
	vec4 gValue = texture2D(u_modVCanvas, gUV);

	vec4 store = texture2D(u_modVCanvas, uv);
	if(red) store.r = rValue.r;
	if(blue) store.b = bValue.b;
	if(green) store.g = gValue.g;

	gl_FragColor = store;
}