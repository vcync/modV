// derived from here: https://www.shadertoy.com/view/MsXGD4

precision mediump float;
uniform float iGlobalTime;
uniform sampler2D u_modVCanvas;
uniform float diagonalSlideDistance; //10.0
uniform float diagonalSlideOffset; //4.0
uniform float scan1Value; //2.0
uniform float scan2Value; //2.0
uniform float timeMultiplier; // 1.0
varying vec2 vUv;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec2 scandistort(vec2 uv) {
	float scan1 = clamp(cos(uv.y * scan1Value - (iGlobalTime * timeMultiplier)), 0.0, 1.0);
	float scan2 = clamp(cos(uv.y * scan2Value - (iGlobalTime * timeMultiplier) + diagonalSlideOffset) * diagonalSlideDistance, 0.0, 1.0) ;
	float amount = scan1 * scan2 * uv.x;

	uv.x -= 0.05 * mix(rand(uv) * amount, amount, 0.9);

	return uv;
}

void main() {
	vec2 uv = vUv.xy;
	vec2 sd_uv = scandistort(uv);

	gl_FragColor = texture2D(u_modVCanvas, sd_uv);
}