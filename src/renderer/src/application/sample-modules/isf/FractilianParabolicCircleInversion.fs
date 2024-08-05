/*{
	"CREDIT": "by mojovideotech",
	"DESCRIPTION": "",
	"CATEGORIES": [
		"generator"
	],
	"INPUTS": [
	{
		"NAME" : 		"center",
		"TYPE" : 		"point2D",
		"DEFAULT" :	 	[ 0.0, 0.0 ],
		"MAX" : 		[ 1.0, 1.0 ],
     	"MIN" : 		[ -1.0, -1.0 ]
	},
	{
		"NAME" : 		"scale",
		"TYPE" : 		"float",
		"DEFAULT" : 	2.0,
		"MIN" : 		0.5,
		"MAX" : 		3.0
	},
	{
		"NAME" : 		"rate",
		"TYPE" : 		"float",
		"DEFAULT" : 	0.15,
		"MIN" : 		-0.5,
		"MAX" : 		0.5
	},
	{
     	"NAME" : 		"fine",
      	"TYPE" :		"float",
      	"DEFAULT" :		0.35,
      	"MIN" : 		0.01,
      	"MAX" : 		0.5
    },
	{
		"NAME" : 		"loops",
		"TYPE" : 		"float",
		"DEFAULT" :	    32.0,
		"MIN" : 		12.0,
		"MAX" : 		100.0
	},
	{
      	"NAME" : 		"r1",
      	"TYPE" : 		"float",
      	"DEFAULT" :		-0.25,
      	"MIN" : 		-0.5,
      	"MAX" : 		0.5
    },
    {
      	"NAME" : 		"r2",
      	"TYPE" : 		"float",
      	"DEFAULT" :		0.275,
      	"MIN" : 		-0.5,
      	"MAX" : 		0.5
    },
	{
		"NAME" : 		"brightness",
		"TYPE" : 		"float",
		"DEFAULT" :  	1.5,
		"MIN" : 		0.1,
		"MAX" : 		5.0
	},
	{
		"NAME" : 		"bleed",
		"TYPE" : 		"float",
		"DEFAULT" :  	0.75,
		"MIN" : 		0.01,
		"MAX" : 		0.99
	},
	{
		"NAME" : 		"edge",
		"TYPE" : 		"float",
		"DEFAULT" :  	0.5,
		"MIN" : 		0.01,
		"MAX" : 		0.99
	},
	{
		"NAME":			"color",
		"TYPE": 		"color",
		"DEFAULT": 		[ 0.6,
						 0.4,
						 0.9,
						 1.0
						]
	},
	{
   		"NAME" : 		"flipH",
     	"TYPE" : 		"bool",
     	"DEFAULT" : 	 false
   	},	
	{
   		"NAME" : 		"flipV",
     	"TYPE" : 		"bool",
     	"DEFAULT" : 	false
   	},
	{
   		"NAME" : 		"mirrorH",
     	"TYPE" : 		"bool",
     	"DEFAULT" : 	true
   	},	
	{
   		"NAME" : 		"mirrorV",
     	"TYPE" : 		"bool",
     	"DEFAULT" : 	false
   	},
   		{
   		"NAME" : 		"blend",
     	"TYPE" : 		"bool",
     	"DEFAULT" : 	false
   	},
   	{
   		"NAME" : 		"invert",
     	"TYPE" : 		"bool",
     	"DEFAULT" : 	false
   	}


	]
}*/



////////////////////////////////////////////////////////////
// FractilianParabolicCircleInversion  by mojovideotech
//
// based on :
// Fractal Soup  by @P_Malin
// shadertoy.com/\lsB3zR
//
// License: 
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0
////////////////////////////////////////////////////////////


vec2 CircleInversion(vec2 vPos, vec2 vOrigin, float fRadius) {	
	vec2 vOP = vPos - vOrigin;
	return vOrigin - vOP * fRadius * fRadius / dot(vOP, vOP);
}

float Parabola( float x, float n ) { return pow( 4.0*x*(1.0-x), n ); }

void main()
{
	vec2 pos = gl_FragCoord.xy/RENDERSIZE.xy;
	if (mirrorV) { if (pos.y < 0.5) pos.y = 1.0-pos.y; }
	if (mirrorH) { if (pos.x < 0.5) pos.x = 1.0-pos.x; }
	pos.x *= RENDERSIZE.x / RENDERSIZE.y;
	if (flipH) { pos.x = 1.0 - pos.x; }
	if (flipV) { pos.y = 1.0 - pos.y; }
	float T = TIME * rate + fine;
	float TT = T * 0.05;
	float drift = mix(pos.x+sin(TT),sin(pos.x)*cos(pos.x-TT),sin(pos.y-TT));
	vec2 spin = vec2( sin(T*r1), -sin(T*r2))+center;
	float l = 0.0, b = 0.0, m = 10000.0;
	vec2 p = pos.xy;	
	for(int i=0; i<100; i++) {
		p.x = abs(p.x);
		p = p * scale + spin;
		p = CircleInversion(p, vec2(0.5, 0.5), 1.0);
		l = length(p);
		m = min(l, m);
		m += Parabola(m, drift);
		b += 1.0;
		if (b>loops) break; 
}
	
	vec3 col = color.rgb * l * l * brightness;
	col = mix(col,pow(col,vec3(m)),1.0-edge);
	col = mix(col,col*fract(m*col+m),bleed);
	if (blend) { col = 1.0 - exp(-col); }
	if (invert) { gl_FragColor = vec4(1.0-col,1.0); }
	else
	gl_FragColor = vec4(col,1.0);
}

