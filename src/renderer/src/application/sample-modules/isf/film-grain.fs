/*
{
  "CATEGORIES" : [
    "XXX"
  ],
  "DESCRIPTION" : "",
  "INPUTS" : [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME" : "strength",
      "TYPE" : "float",
      "DEFAULT" : 16.0,
      "MIN": 0.0,
      "MAX": 50.0,
      "LABEL" : "Strength"
    },
    {
      "NAME": "secondaryOperation",
      "TYPE": "long",
      "VALUES": [
        0,
        1
      ],
      "LABELS": [
        "One",
        "Two"
      ],
      "DEFAULT": 0
  }
  ],
  "CREDIT" : ""
}
*/

void main() {
  vec2 uv = gl_FragCoord.xy;
  vec4 color = IMG_THIS_PIXEL(inputImage);

  float x = (uv.x + 4.0) * (uv.y + 4.0) * TIME;
  vec4 grain = vec4(mod((mod(x, 13.0) + 1.0) * (mod(x, 123.0) + 1.0), 0.01)-0.005) * strength;

  // if(abs(uv.x - 0.5) < 0.002)
  //  color = vec4(0.0);

  if(secondaryOperation == 0) {
    grain = 1.0 - grain;
    gl_FragColor = color * grain;
  } else {
    gl_FragColor = color + grain;
  }
}