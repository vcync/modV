// from here: https://getmosh.io/

precision mediump float;

uniform sampler2D u_modVCanvas;
uniform float slices;
uniform float offset;
uniform float iGlobalTime;
uniform float timeMultiplier; // 1.0
varying vec2 vUv;

float rand(vec2 co){
	return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
	vec2 p = vUv;
	float yInt = floor(p.y * slices)/slices;
	float rnd = rand(vec2(yInt,yInt));
	p.x += sin((iGlobalTime * timeMultiplier) * rnd/5.0) * offset - offset/2.0;
	p.x = fract(p.x);
	gl_FragColor = texture2D(u_modVCanvas, p);
}