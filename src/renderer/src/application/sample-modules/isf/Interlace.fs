/*{
	"DESCRIPTION": "",
	"CREDIT": "by Carter Rosenberg",
	"ISFVSN": "2",
	"CATEGORIES": [
		"Film"
	],
	"INPUTS": [
		{
			"NAME": "inputImage",
			"TYPE": "image"
		},
		{
			"NAME": "lineSize",
			"LABEL": "Line Size",
			"TYPE": "float",
			"MIN": 1.0,
			"MAX": 50.0,
			"DEFAULT": 4.0
		}
	],
	"PASSES": [
		{
			"TARGET":"lastRow",
			"WIDTH": "1",
			"HEIGHT": "1",
			"DESCRIPTION": "this buffer stores the last frame's odd / even state",
			"PERSISTENT": true
		},
		{
			"TARGET":"lastFrame",
			"PERSISTENT": true
		}
	]
	
}*/

void main()
{
	//	if this is the first pass, i'm going to read the position from the "lastRow" image, and write a new position based on this and the hold variables
	if (PASSINDEX == 0)	{
		vec4		srcPixel = IMG_PIXEL(lastRow,vec2(0.5));
		//	i'm only using the X and Y components, which are the X and Y offset (normalized) for the frame
		srcPixel.x = (srcPixel.x) > 0.5 ? 0.0 : 1.0;
		gl_FragColor = srcPixel;
	}
	//	else this isn't the first pass- read the position value from the buffer which stores it
	else	{
		vec4		lastRow = IMG_PIXEL(lastRow,vec2(0.5));
		vec2		pixelCoord = isf_FragNormCoord * RENDERSIZE;
		
		if (mod(floor(pixelCoord.y),2.0 * lineSize) < lineSize + lineSize * lastRow.x)
			gl_FragColor = IMG_NORM_PIXEL(inputImage,isf_FragNormCoord);
		else
			gl_FragColor = IMG_NORM_PIXEL(lastFrame,isf_FragNormCoord);
	}
}
