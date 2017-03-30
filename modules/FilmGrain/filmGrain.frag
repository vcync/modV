// from here: https://www.shadertoy.com/view/4sXSWs

precision mediump float;

uniform float iGlobalTime;
uniform sampler2D u_modVCanvas;
uniform float strength; //16.0
uniform bool secondaryOperation; //false
varying vec2 vUv;

void main() {
	vec4 color = texture2D(u_modVCanvas, vUv);

	float x = (vUv.x + 4.0 ) * (vUv.y + 4.0 ) * (iGlobalTime);
	vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;

	// if(abs(uv.x - 0.5) < 0.002)
	// 	color = vec4(0.0);

	if(secondaryOperation) {
		grain = 1.0 - grain;
		gl_FragColor = color * grain;
	} else {
		gl_FragColor = color + grain;
	}
}