/*
{
  "CATEGORIES" : [
    "effect"
  ],
  "DESCRIPTION" : "Pinch",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "center",
      "TYPE" : "point2D",
      "DEFAULT": [0.5,0.5],
      "MIN": [0,0],
      "MAX": [1,1]
    },
    {
      "NAME" : "amount",
      "TYPE" : "float",
      "MAX" : 4.0,
      "DEFAULT" : 2.0,
      "MIN" : 0
    }
  ],
  "CREDIT" : "2xAA"
}
*/

precision mediump float;

void main() {

  vec2 uv = gl_FragCoord.xy / RENDERSIZE.xy;

  // normalize to the center
  uv = uv - center;

  // cartesian to polar coordinates
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // distort
  r = sqrt(r/amount); // pinch

  // polar to cartesian coordinates
  uv = r * vec2(cos(a), sin(a));

  uv = uv + center;

  vec4 c = IMG_NORM_PIXEL(inputImage, uv);
  gl_FragColor = c;
}