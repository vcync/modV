/*{
  "CREDIT": "by VIDVOX",
  "CATEGORIES": [
    "Stylize"
  ],
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "intensity",
      "TYPE": "float",
      "MIN": 0,
      "MAX": 10,
      "DEFAULT": 2
    },
    {
      "NAME": "colorize",
      "TYPE": "float",
      "MIN": 0,
      "MAX": 1,
      "DEFAULT": 1
    },
    {
      "NAME": "brightness",
      "TYPE": "float",
      "MIN": 0.25,
      "MAX": 0.75,
      "DEFAULT": 0.5
    }
  ]
}*/


varying vec2 left_coord;
varying vec2 right_coord;
varying vec2 above_coord;
varying vec2 below_coord;

varying vec2 lefta_coord;
varying vec2 rightb_coord;

float gray(vec4 n)
{
	return (n.r + n.g + n.b)/3.0;
}

void main()
{

	vec4 colorL = IMG_NORM_PIXEL(inputImage, left_coord);
	vec4 colorR = IMG_NORM_PIXEL(inputImage, right_coord);
	vec4 colorA = IMG_NORM_PIXEL(inputImage, above_coord);
	vec4 colorB = IMG_NORM_PIXEL(inputImage, below_coord);

	vec4 colorLA = IMG_NORM_PIXEL(inputImage, lefta_coord);
	vec4 colorRB = IMG_NORM_PIXEL(inputImage, rightb_coord);

	vec4 final = intensity * (colorR + colorB + colorRB - colorL - colorA - colorLA) + brightness;
	float grayscale = gray(final);
	final = mix(vec4(grayscale,grayscale,grayscale,final.a),final,colorize);
	gl_FragColor = final;
}