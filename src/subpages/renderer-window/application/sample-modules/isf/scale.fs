/*
{
  "CATEGORIES" : [
    "transform"
  ],
  "DESCRIPTION" : "Scale",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "scale",
      "TYPE" : "float",
      "MAX" : 2.0,
      "DEFAULT" : 0.0,
      "MIN" : -2.0
    }
  ],
  "CREDIT" : "2xAA"
}
*/

void main() {
  vec2 uv = gl_FragCoord.xy / RENDERSIZE.xy;

  uv -= 0.5;

  uv.x = uv.x / (1.0 + scale);
  uv.y = uv.y / (1.0 + scale);

  uv += 0.5;

  gl_FragColor = IMG_NORM_PIXEL(inputImage, uv);
}
