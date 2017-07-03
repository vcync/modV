/*
{
  "CATEGORIES" : [
    "XXX"
  ],
  "DESCRIPTION" : "",
  "ISFVSN" : "2",
  "INPUTS" : [
    {
      "NAME" : "timeScale",
      "TYPE" : "float",
      "DEFAULT" : 100,
      "LABEL" : "Time Scale"
    },
    {
      "NAME" : "scaleX",
      "TYPE" : "float",
      "MAX" : 150,
      "DEFAULT" : 50,
      "LABEL" : "Scale X",
      "MIN" : 1
    },
    {
      "NAME" : "scaleY",
      "TYPE" : "float",
      "MAX" : 150,
      "DEFAULT" : 50,
      "LABEL" : "Scale Y",
      "MIN" : 1
    }
  ],
  "CREDIT" : ""
}
*/
#define PI 3.1415926535897932384626433832795

void main() {
	float time = TIME / timeScale;
	vec2 scale = vec2(RENDERSIZE.x / scaleX, RENDERSIZE.y / scaleY);
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