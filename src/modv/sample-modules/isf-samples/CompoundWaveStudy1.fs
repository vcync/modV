/*{
	"CREDIT": "by mojovideotech",
	"DESCRIPTION": "",
	"CATEGORIES": [
		"generator",
		"waves"
	],
	"INPUTS": [
		{
			"NAME": "color",
			"TYPE": "color",
			"DEFAULT": [
				0.5,
				0.3,
				0.6,
				1.0
			]
		},
		{
			"NAME" : 		"a",
			"TYPE" : 		"float",
			"DEFAULT" : 	0.5,
			"MIN" : 		0.0,
			"MAX" : 		1.0
		},
		{
			"NAME" : 		"b",
			"TYPE" : 		"float",
			"DEFAULT" : 	0.5,
			"MIN" : 		0.0,
			"MAX" : 		1.0
		},
		{
			"NAME" : 		"c",
			"TYPE" : 		"float",
			"DEFAULT" : 	0.5,
			"MIN" : 		0.0,
			"MAX" : 		1.0
		},
		{
			"NAME" : 		"rate",
			"TYPE" : 		"float",
			"DEFAULT" : 	0.5,
			"MIN" : 		-2.0,
			"MAX" : 		2.0
		}
	]
}*/

////////////////////////////////////////////////////////////
// CompoundWaveStudy1  by mojovideotech
//
// License: 
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0
////////////////////////////////////////////////////////////


float T = TIME * rate;

float f1(float x) {
	return sin(x-T);
}

float f2(float x) {
	return f1(cos(x-sin(T*b))+f1(sin(T*a)))*c;
}

float f3(float x) {
	return mix(f2(sin(4.0*x*b) ),cos(a)*c,f1(x));
}

float f4(float x) {
	return f1(1.0-x*x);
}

float f5(float x) {
	return f4(f1(x-T)-f2(f4(x)));
}

float f6(float x) {
	return f4(f1(f2(x))-f5(f1(x-T)));
}

void main() {
	vec2 p = 2.0 * (gl_FragCoord.xy/RENDERSIZE.xy) - 1.0;
	p.x += 1.0;
	p *= vec2(10.0, 1.5);
	float f = step(f3(p.x),-p.y);//-step(f3(p.x),p.y+0.15);
	float g = step(f5(p.x),p.y-0.25)-step(f5(p.x),p.y+0.25);
	float h = step(f6(p.x),p.y-0.33)-step(f6(p.x),p.y+0.33);
 	vec4 k = vec4(g,h,f,1.0);
 	gl_FragColor = vec4(g,h,f, 1.0) + k;
	gl_FragColor *= pow(vec4(k),vec4(3.0));
	//gl_FragColor = color;
}