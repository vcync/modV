/*{
	"CREDIT": "by mojovideotech",
  	"CATEGORIES" : [
  		"Distortion Effect",
  		"Geometry Adjustment",
    	"spiral",
    	"logarithmic",
    	"coordinatetransform"
  ],
  "DESCRIPTION" : "Transformation from screen-coordinates to logarithmic spiral with golden angle.",
  "INPUTS" : [
		{
			"NAME": "rate",
			"TYPE": "float",
			"DEFAULT": 0.25,
			"MIN": -1.0,
			"MAX": 1.0
		},
		{
      		"NAME" : "imageInput",
      		"TYPE" : "image",
      		"LABEL" : "imageInput"
    	},
    	{
      			"NAME": "sinwarp",
      			"TYPE": "bool",
      			"DEFAULT": false
    	}	
  ]
}
*/

////////////////////////////////////////////////////////////
// LogTransWarpSpiral  by mojovideotech
//
// based on :
// shadertoy.com\/Msd3Dn
// Logarithmic Spiral Transform - 2015-12-02 by Jakob Thomsen
//
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0
////////////////////////////////////////////////////////////


#define 	twpi  	6.2831853  	// two pi, 2*pi
#define		piphi	2.3999632	// pi*(3-sqrt(5))

void main() {
	float T = TIME * rate;
    vec2 p = (gl_FragCoord.xy+gl_FragCoord.xy-RENDERSIZE.xy)/RENDERSIZE.y;
	p = vec2(0.0, T - log2(length(p.xy))) + atan(p.y, p.x) / twpi; 
   	p.x = ceil(p.y) - p.x;
    p.x *= piphi;
	if (sinwarp) p.y -= pow(T/twpi,sin(T));
    gl_FragColor = IMG_NORM_PIXEL(imageInput,fract(p.yx+T));
}
