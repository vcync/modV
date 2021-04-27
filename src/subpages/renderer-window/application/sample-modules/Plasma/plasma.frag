/* spec: webgl */
precision mediump float;

#define PI 3.1415926535897932384626433832795

uniform float u_time;
uniform float u_scaleX;
uniform float u_scaleY;
uniform float u_timeScale;
uniform vec3 iResolution;
varying vec2 vUv;

void main() {
	float time = u_time / u_timeScale;
	vec2 u_scale = vec2(iResolution.x / u_scaleX, iResolution.y / u_scaleY);
	float v = 0.0;
	vec2 c = vUv * u_scale - u_scale/2.0;
	v += sin((c.x+time));
	v += sin((c.y+time)/2.0);
	v += sin((c.x+c.y+time)/2.0);
	c += u_scale/2.0 * vec2(sin(time/3.0), cos(time/2.0));
	v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+time);
	v = v/2.0;
	vec3 col = vec3(1, sin(PI*v), cos(PI*v));
	gl_FragColor = vec4(col*.5 + .5, 1);
}