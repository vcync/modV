/*
{
  "CATEGORIES" : [
    "effect"
  ],
  "DESCRIPTION" : "Slice",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "slices",
      "TYPE" : "float",
      "MAX" : 200,
      "DEFAULT" : 10,
      "MIN" : 1
    },
    {
      "NAME" : "offset",
      "TYPE" : "float",
      "MAX" : 0.5,
      "DEFAULT" : 0.03,
      "MIN" : 0
    },
    {
      "NAME" : "timeMultiplier",
      "TYPE" : "float",
      "MAX" : 3.0,
      "DEFAULT" : 1.0,
      "MIN" : 0.0
    }
  ],
  "CREDIT" : "https://getmosh.io/"
}
*/

precision mediump float;

varying vec2 vUv;

float rand(vec2 co){
  return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

void main() {
  vec2 p = gl_FragCoord.xy / RENDERSIZE.xy;
  float yInt = floor(p.y * slices) / slices;
  float rnd = rand(vec2(yInt, yInt));
  p.x += sin((TIME * timeMultiplier) * rnd / 5.0) * offset - offset / 2.0;
  p.x = fract(p.x);
  gl_FragColor = texture2D(inputImage, p);
}