/*
{
  "CATEGORIES" : [
    "effect"
  ],
  "DESCRIPTION" : "Kaleidoscope",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "sides",
      "TYPE" : "float",
      "MAX" : 60,
      "DEFAULT" : 5,
      "MIN" : 2
    }
  ],
  "CREDIT" : "2xAA"
}
*/

void main() {

  vec2 uv = gl_FragCoord.xy/RENDERSIZE.xy;

  // normalize to the center
  uv = uv - 0.5;

  // cartesian to polar coordinates
  float r = length(uv);
  float a = atan(uv.y, uv.x);

  // kaleidoscope
  //float sides = 5.;
  float tau = 2. * 3.1416;
  a = mod(a, tau/sides);
  a = abs(a - tau/sides/2.);

  // polar to cartesian coordinates
  uv = r * vec2(cos(a), sin(a));

  // recenter
  uv = uv + 0.5;

  vec4 c = IMG_NORM_PIXEL(inputImage, uv);
  gl_FragColor = c;
}