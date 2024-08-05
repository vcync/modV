/*
{
  "DESCRIPTION" : "A simple Vignette",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "intensity",
      "TYPE" : "float",
      "MAX" : 100,
      "DEFAULT" : 15,
      "MIN" : 1,
      "LABEL" : "Intensity"
    },
    {
      "NAME" : "extension",
      "TYPE" : "float",
      "MAX" : 2.5,
      "DEFAULT" : 0.25,
      "MIN" : 0.05,
      "LABEL" : "Extension"
    }
  ],
  "CREDIT" : "2xAA"
}
*/

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
  vec2 uv = fragCoord.xy / RENDERSIZE.xy;
  uv *=  1.0 - uv.yx;   //vec2(1.0)- uv.yx; -> 1.-u.yx; Thanks FabriceNeyret !
  float vig = uv.x * uv.y * intensity; // multiply with sth for intensity
  vig = pow(vig, extension); // change pow for modifying the extend of the  vignette
  fragColor = vec4(IMG_NORM_PIXEL(inputImage, isf_FragNormCoord).rgb * (clamp(vig, 0., 1.)), 1.0);
}

void main(void) {
  mainImage(gl_FragColor, gl_FragCoord.xy);
}