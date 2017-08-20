/*{
  "CREDIT": "by mojovideotech",
  "DESCRIPTION": "",
  "CATEGORIES": [
      "generator",
      "spiral"
  ],
  "INPUTS": [
    {
      "NAME": "shifth",
      "TYPE": "float",
      "DEFAULT": 0,
      "MIN": -3,
      "MAX": 3
    },
    {
      "NAME": "shiftv",
      "TYPE": "float",
      "DEFAULT": 0,
      "MIN": -2,
      "MAX": 2
    },
    {
      "NAME": "rate",
      "TYPE": "float",
      "DEFAULT": 16,
      "MIN": 0.1,
      "MAX": 24
    },
    {
      "NAME": "density",
      "TYPE": "float",
      "DEFAULT": 64,
      "MIN": 6,
      "MAX": 256
    },
    {
      "NAME": "sectors",
      "TYPE": "float",
      "DEFAULT": 64,
      "MIN": 1,
      "MAX": 256
    },
    {
      "NAME": "shape",
      "TYPE": "float",
      "DEFAULT": 32,
      "MIN": 16,
      "MAX": 256
    },
    {
      "NAME": "smooth",
      "TYPE": "float",
      "DEFAULT": 0.05,
      "MIN": 0,
      "MAX": 1
    },
    {
      "NAME": "vanishingpoint",
      "TYPE": "float",
      "DEFAULT": 0,
      "MIN": 0,
      "MAX": 2
    }
  ]
}*/


////////////////////////////////////////////////////////////
// UltimateSpiral  by mojovideotech
//
// Creative Commons Attribution-NonCommercial-ShareAlike 3.0
////////////////////////////////////////////////////////////

#define   AA      2.0

float cell (float t, float w, float p) {
  return min (step (t-w/2.0,p), 1.0 - step (t+w/2.0,p));
}

mat2 rotate (float o) {
  float c = cos (o);
  float s = sin (o);
  return mat2 (-s, c, c, s);
}

vec4 spiral (vec2 uv) {
  float f = length (uv) * density;
  float g = atan (uv.y, uv.x);
  uv *= rotate (TIME*rate);
  uv *= sin (g*floor(sectors));
  uv *= rotate (f);
  return mix (vec4 (0.99), vec4 (0.0), min (
    step (smooth, uv.x),
    cell (vanishingpoint, f/shape, uv.y)));
}

void main ( void ) {
  float unit =  1.0/min (RENDERSIZE.x, RENDERSIZE.y);
  vec2 uv = (2.0*gl_FragCoord.xy - RENDERSIZE.xy) * unit;
  vec4 col = vec4 (0.0);
  for (float y = 0.0; y < AA; ++y) {
    for (float x = 0.0; x < AA; ++x) {
      vec2 c =  vec2 (
        (x-AA/2.0)*(unit/AA)+shifth,
        (y-AA/2.0)*(unit/AA)+shiftv);
      col += spiral (uv + c) / (AA*AA);
    }
  }
  gl_FragColor = col;


}