/*{
	"DESCRIPTION": "RGB GLitchMod",
	"CREDIT": "by dantheman",
	"CATEGORIES": [
		"Distortion Effect"
	],
	"INPUTS": [
		{
			"NAME": "inputImage",
			"TYPE": "image"
		},
		{
			"NAME": "offset",
			"TYPE": "float",
			"MIN":0.0,
			"MAX":0.5,
			"DEFAULT": 0.25
		},
		{
			"NAME": "offset_right",
			"TYPE": "float",
			"MIN":0.0,
			"MAX":0.1,
			"DEFAULT": 0
		},
		{
		  "NAME": "mix_var",
		  "TYPE":"float",
		  "MIN":0.0,
			"MAX":1.0,
			"DEFAULT": 1.0
		}
  ],
	"PERSISTENT_BUFFERS": [
		"one"
	],
	"PASSES": [
		{
			"TARGET":"one",
			"WIDTH": "$WIDTH",
			"HEIGHT": "$HEIGHT",
			"DESCRIPTION": "buffer"
		}
	]

}*/


void main() {

  vec2 pos = isf_FragNormCoord;
  vec4 old = IMG_NORM_PIXEL(one, pos);
  vec4 new = IMG_NORM_PIXEL(inputImage, pos);

  gl_FragColor = (new  + old * mix_var * 10.0) / (1.0 + mix_var * 10.0);
}
