precision mediump float;

uniform float aperture;

const float PI = 3.141569;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	vec2 texturespace_uv = fragCoord.xy / iResolution.yy;

  float apertureHalf = 0.5 * aperture * (PI / 180.0);
  // float maxFactor = sin(apertureHalf);
  float maxFactor = apertureHalf;

  vec4 c;
  vec2 uv;
  vec2 xy = 2.0 * texturespace_uv.xy - 1.0;
  xy.x = xy.x - 0.75;
  float d = length(xy);
  if (d < (2.0-maxFactor))
  {
    d = length(xy * maxFactor);
    float z = 2.0 * sqrt(1.0 - d * d);
    float r = atan(d, z) / PI;
    float phi = atan(xy.y, xy.x);

    uv.x = r * cos(phi) + 0.5;
    uv.y = r * sin(phi) + 0.5;

      // WARP IT A LITTLE BIT
      // uv.s += 0.02 * sin(4.0 * iTime + 15.0 * uv.t);
      c = texture(u_modVCanvas, uv);
  }
  else
  {
    c = vec4(0.,0.,0.,1.);
  }


  fragColor = c;
}
