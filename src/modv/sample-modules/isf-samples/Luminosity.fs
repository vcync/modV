/*{
	"CREDIT": "2xAA",
	"ISFVSN": "2",
	"CATEGORIES": [
		"Color Adjustment"
	],
	"INPUTS": [
		{
			"NAME": "inputImage",
			"TYPE": "image"
		},
		{
			"NAME": "inputImage2",
			"TYPE": "image"
		}
	]
}*/

void main() {


// Normalized pixel coordinates (from 0 to 1)
    vec2 uv = vec2(isf_FragNormCoord.x, isf_FragNormCoord.y);

    vec4 tex2 = IMG_NORM_PIXEL(inputImage2, uv);

	uv.x += ((sin(TIME/9.)+1.) / 2.) * (
        cos((TIME+3.*tex2.r))
    );


    uv.y += ((cos(TIME/50.)+1.) / 2.) * (
        sin((TIME/10.+3.*uv.x*uv.y)) *
         cos((TIME/20.+2.*tex2.b*tex2.g))
    );


    vec4 oricol = IMG_NORM_PIXEL(inputImage, uv).rgba;

    // Output to screen
    gl_FragColor = oricol;
}
