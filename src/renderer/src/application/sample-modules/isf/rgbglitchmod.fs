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



void main()
{
  vec2 uv = isf_FragNormCoord.xy;
	vec2 texCoord = uv;
	//	if this is the first pass, i'm going to read the position from the "lastPosition" image, and write a new position based on this and the hold variables

		 vec4	srcPixel = IMG_NORM_PIXEL(inputImage,texCoord);
		 vec4	newPixel = IMG_NORM_PIXEL(one, texCoord);
		 srcPixel = mod((srcPixel+newPixel), vec4(1.0));
		 srcPixel *= 0.50;

		//	i'm only using the X, which is the last render time we reset
		gl_FragColor = vec4(srcPixel.rgb, 1.0);
}
