/*
{
  "DESCRIPTION" : "Brightness\/Contrast adjustment",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "brightness",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0,
      "MIN" : -1
    },
    {
      "NAME" : "contrast",
      "TYPE" : "float",
      "MAX" : 2,
      "DEFAULT" : 1,
      "MIN" : 0
    }
  ],
  "CREDIT" : ""
}
*/

void main()	{
  vec3 color = IMG_PIXEL(inputImage, gl_FragCoord.xy).rgb;
	vec3 colorContrasted = (color) * contrast;
	vec3 bright = colorContrasted + vec3(brightness,brightness,brightness);
	gl_FragColor = vec4(bright, IMG_PIXEL(inputImage, gl_FragCoord.xy).a);
}
