/*{
	"CREDIT": "by VIDVOX",
	"ISFVSN": "2",
	"CATEGORIES": [
		"Tile Effect"
	],
	"INPUTS": [
		{
			"NAME": "inputImage",
			"TYPE": "image"
		},
		{
			"NAME": "angle",
			"LABEL": "Angle",
			"TYPE": "float",
			"MIN": 0.0,
			"MAX": 1.0,
			"DEFAULT": 0.0
		},
		{
			"NAME": "shift",
			"LABEL": "Shift",
			"TYPE": "point2D",
			"DEFAULT": [
				0.0,
				0.5
			]
		}
	]
}*/


varying vec2 translated_coord;


void main() {
	vec2 loc = translated_coord;
	vec2 modifiedCenter = shift / RENDERSIZE;
	
	loc = mod(loc + modifiedCenter, 1.0);
	
	//	mirror the image so it's repeated 4 times at different reflections
	loc = 2.0 * abs(loc - 0.5);
	
	gl_FragColor = IMG_NORM_PIXEL(inputImage, loc);
}