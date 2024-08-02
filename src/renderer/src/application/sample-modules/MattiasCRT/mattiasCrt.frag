precision mediump float;
uniform sampler2D u_modVCanvas;
uniform float u_delta;
uniform vec3 iResolution;
varying vec2 vUv;
varying vec2 fragCoord;

// from here: https://www.shadertoy.com/view/Ms23DR
// Loosely based on postprocessing shader by inigo quilez, License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License.

vec2 curve(vec2 uv) {
	uv = (uv - 0.5) * 2.0;
	uv *= 1.1;
	uv.x *= 1.0 + pow((abs(uv.y) / 5.0), 2.0);
	uv.y *= 1.0 + pow((abs(uv.x) / 4.0), 2.0);
	uv  = (uv / 2.0) + 0.5;
	uv =  uv *0.92 + 0.04;
	return uv;
}

void main() {
	vec2 uv = vUv;

	uv = curve( uv );
	vec3 oricol = texture2D( u_modVCanvas, vec2(uv.x,uv.y) ).xyz;
	vec3 col;
	float x =  sin(0.3*u_delta+uv.y*21.0)*sin(0.7*u_delta+uv.y*29.0)*sin(0.3+0.33*u_delta+uv.y*31.0)*0.0017;

	col.r = texture2D(u_modVCanvas,vec2(x+uv.x+0.001,uv.y+0.001)).x+0.05;
	col.g = texture2D(u_modVCanvas,vec2(x+uv.x+0.000,uv.y-0.002)).y+0.05;
	col.b = texture2D(u_modVCanvas,vec2(x+uv.x-0.002,uv.y+0.000)).z+0.05;
	col.r += 0.08*texture2D(u_modVCanvas,0.75*vec2(x+0.025, -0.027)+vec2(uv.x+0.001,uv.y+0.001)).x;
	col.g += 0.05*texture2D(u_modVCanvas,0.75*vec2(x+-0.022, -0.02)+vec2(uv.x+0.000,uv.y-0.002)).y;
	col.b += 0.08*texture2D(u_modVCanvas,0.75*vec2(x+-0.02, -0.018)+vec2(uv.x-0.002,uv.y+0.000)).z;

	col = clamp(col*0.6+0.4*col*col*1.0,0.0,1.0);

	float vig = (0.0 + 1.0*16.0*uv.x*uv.y*(1.0-uv.x)*(1.0-uv.y));
	col *= vec3(pow(vig,0.3));

	col *= vec3(0.95,1.05,0.95);
	col *= 2.8;

	float scans = clamp( 0.35+0.35*sin(3.5*u_delta+uv.y*iResolution.y*1.5), 0.0, 1.0);

	float s = pow(scans,1.7);
	col = col*vec3( 0.4+0.7*s) ;

	col *= 1.0+0.01*sin(110.0*u_delta);
	if (uv.x < 0.0 || uv.x > 1.0)
		col *= 0.0;
	if (uv.y < 0.0 || uv.y > 1.0)
		col *= 0.0;

	col*=1.0-0.65*vec3(clamp((mod(fragCoord.x, 2.0)-1.0)*2.0,0.0,1.0));

	float comp = smoothstep( 0.1, 0.9, sin(u_delta) );

	// Remove the next line to stop cross-fade between original and postprocess
	//	col = mix( col, oricol, comp );

	gl_FragColor = vec4(col,1.0);
}