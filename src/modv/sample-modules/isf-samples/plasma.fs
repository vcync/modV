/*
{
  "CATEGORIES" : [
    "XXX"
  ],
  "DESCRIPTION" : "",
  "INPUTS" : [
    {
      "NAME" : "timeScale",
      "TYPE" : "float",
      "DEFAULT" : 0.18,
      "MIN": 0.001,
      "MAX": 2.0,
      "LABEL" : "Time Scale"
    },
    {
      "NAME": "uScale",
      "TYPE": "point2D",
      "LABEL" : "Scale",
      "DEFAULT": [
        10.5,
        10.5
      ],
      "MAX": 50.0,
      "MIN": 0.001
    }
  ],
  "CREDIT" : ""
}
*/

const float PI = 3.1415926535897932384626433832795;

void main() {
	float time = TIME / timeScale;
	vec2 scale = vec2(RENDERSIZE.x / uScale.x, RENDERSIZE.y / uScale.y);
	float v = 0.0;
	vec2 c = isf_FragNormCoord * scale - scale/2.0;
	v += sin((c.x+time));
	v += sin((c.y+time)/2.0);
	v += sin((c.x+c.y+time)/2.0);
	c += scale/2.0 * vec2(sin(time/3.0), cos(time/2.0));
	v += sin(sqrt(c.x*c.x+c.y*c.y+1.0)+time);
	v = v/2.0;
	vec3 col = vec3(1, sin(PI*v), cos(PI*v));
	gl_FragColor = vec4(col*.5 + .5, 1);
}