/*
{
  "CATEGORIES" : [
    "zoomer"
  ],
  "DESCRIPTION" : "Rotozoomer",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "rotationSpeed",
      "TYPE" : "float",
      "MAX" : 360,
      "DEFAULT" : 45,
      "MIN" : 0,
      "LABEL" : "Rotation Speed"
    },
    {
      "NAME" : "zoomScale",
      "TYPE" : "float",
      "MAX" : 10,
      "DEFAULT" : 3,
      "LABEL" : "Zoom Scale",
      "MIN" : 1
    },
    {
      "NAME" : "timeScale",
      "TYPE" : "float",
      "MAX" : 3,
      "DEFAULT" : 1,
      "MIN" : -3
    }
  ],
  "PASSES" : [
    {

    }
  ],
  "CREDIT" : "LukasPukenis "
}
*/

vec3 iResolution = vec3(RENDERSIZE, 1.);

float PI = 3.14;

vec2 rotate(vec2 v, float angle) {
  angle = angle * PI / 180.0;
  return vec2(cos(angle)*v.x - v.y*sin(angle),
        cos(angle)*v.y + v.x*sin(angle));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
  float time = TIME * timeScale;
  float zoom = (2.0+sin(time))/zoomScale;
  vec2 as = vec2(iResolution.y / iResolution.x, 1.0);

  vec2 zoomVec = vec2(zoom, zoom);
  vec2 coords = fragCoord.xy / iResolution.xy;
  coords -= vec2(0.5, 0.5);
  coords /= as;
  coords += vec2(1.0+sin(time), 1.0+sin(time));
  coords *= zoomVec;

  coords = rotate(coords, rotationSpeed * TIME);

  vec4 pixel = IMG_NORM_PIXEL(inputImage, mod(coords+vec2(0.5, 0.5), 1.0));
  fragColor = pixel;
}

void main(void) {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}