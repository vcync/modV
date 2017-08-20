/*
{
  "CATEGORIES" : [
    "bokeh",
    "blur"
  ],
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    },
    {
      "NAME" : "mX",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0.5,
      "LABEL" : "Mouse X",
      "MIN" : 0
    },
    {
      "NAME" : "mY",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0.5,
      "LABEL" : "Mouse Y",
      "MIN" : 0
    },
    {
      "NAME" : "mZ",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0.5,
      "LABEL" : "Mouse Z",
      "MIN" : 0
    },
    {
      "NAME" : "mW",
      "TYPE" : "float",
      "MAX" : 1,
      "DEFAULT" : 0.5,
      "LABEL" : "Mouse W",
      "MIN" : 0
    }
  ],
  "PASSES" : [
    {
      "TARGET" : "buffer1"
    },
    {
      "TARGET" : "buffer2"
    }
  ],
  "ISFVSN" : "2",
  "CREDIT" : "hornet"
}
*/

vec3 iResolution = vec3(RENDERSIZE, 1.);
vec4 iMouse = vec4(mX*RENDERSIZE.x, mY*RENDERSIZE.y, mZ*RENDERSIZE.x, mW*RENDERSIZE.y);

#define USE_RANDOM

const float blurdist_px = 64.0;
const int NUM_SAMPLES = 16;

const float THRESHOLD = 0.1;
const float MULT = 4.0;

vec3 srgb2lin(vec3 c) { return c*c; }
vec3 lin2srgb(vec3 c) { return sqrt(c); }

//note: uniform pdf rand [0;1[
float hash12n(vec2 p)
{
  p  = fract(p * vec2(5.3987, 5.4421));
    p += dot(p.yx, p.xy + vec2(21.5351, 14.3137));
  return fract(p.x * p.y * 95.4307);
}

vec4 pattern( vec2 p )
{
    float aspect = iResolution.x / iResolution.y;
    float p0 = step(abs(p.x-0.125), 0.01) * step(abs(p.y-0.27), 0.01);
    float p1 = step( length( p-vec2(0.125, 0.45) ), 0.025 );

    float p2_0 = step( length( p-vec2(0.08, 0.14) ), 0.0125 );
    float p2_1 = step( length( p-vec2(0.16, 0.125) ), 0.0125 );
    float p2_2 = step( length( p-vec2(0.1, 0.07) ), 0.0125 );
    float p2 = max(p2_0, max(p2_1,p2_2));

    return vec4( max( p0, max(p1,p2) ) );
}

vec3 sampletex( vec2 uv ) {
    float t = fract( 0.1 * TIME );
    return IMG_NORM_PIXEL( buffer1, uv, -10.0 ).rgb;
}

void pass1( out vec4 fragColor, in vec2 fragCoord ) {
    vec2 uv = fragCoord / iResolution.xy;
    float sinblur = ( 0.55 + 0.45 * sin( 5.0 * uv.x + TIME ) );
    float blurdist = (iMouse.z>0.5) ? 100.0 * iMouse.x/iResolution.x : blurdist_px * sinblur;

    float srnd = hash12n(uv+fract(TIME))-0.5;

    vec3 sumcol0 = vec3(0.0);
    {
        vec2 blurdir = vec2( 1.0, 0.577350269189626 );
      vec2 blurvec = normalize(blurdir) / iResolution.xy;
        vec2 p0 = uv - 0.5 * blurdist * blurvec;
      vec2 p1 = uv + 0.5 * blurdist * blurvec;
      vec2 stepvec = (p1-p0) / float(NUM_SAMPLES);
      vec2 p = p0;
        #if defined(USE_RANDOM)
        p += srnd * stepvec;
        #endif

        for (int i=0;i<NUM_SAMPLES;++i)
        {
          sumcol0 += srgb2lin( IMG_NORM_PIXEL( inputImage, p, -10.0 ).rgb);
          p += stepvec;
        }
        sumcol0 /= float(NUM_SAMPLES);
    }

    vec3 sumcol1 = vec3(0.0);
    {
        vec2 blurdir = vec2( -1.0, 0.577350269189626 );
        vec2 blurvec = normalize(blurdir) / iResolution.xy;
        vec2 p0 = uv - 0.5 * blurdist * blurvec;
        vec2 p1 = uv + 0.5 * blurdist * blurvec;
        vec2 stepvec = (p1-p0) / float(NUM_SAMPLES);
        vec2 p = p0;
        #if defined(USE_RANDOM)
        p += srnd * stepvec;
        #endif

        for (int i=0;i<NUM_SAMPLES;++i)
        {
          sumcol1 += srgb2lin( IMG_NORM_PIXEL( inputImage, p, -10.0 ).rgb);
          p += stepvec;
        }
        sumcol1 /= float(NUM_SAMPLES);
    }

    //DEBUG
    //fragColor = vec4( sumcol0, 1.0 ); return;
    //fragColor = vec4( sumcol1, 1.0 ); return;

    vec3 sumcol = min( sumcol0, sumcol1 );

    fragColor = vec4( lin2srgb(sumcol), 1.0 );
}

void pass2( out vec4 fragColor, in vec2 fragCoord ) {
    const vec2 blurdir = vec2( 0.0, 1.0 );
    vec2 blurvec = normalize(blurdir) / iResolution.xx;
    //fragCoord += 25.0 * vec2( cos(TIME), sin(TIME) );
    vec2 suv = fragCoord / iResolution.xy;
    vec2 uv = fragCoord / iResolution.xx;
    float sinblur = ( 0.55 + 0.45 * sin( 5.0 * uv.x + TIME ) );
    float blurdist = (iMouse.z>0.5) ? 100.0 * iMouse.x/iResolution.x : blurdist_px * sinblur;

    vec2 p0 = uv - 0.5 * blurdist * blurvec;
    vec2 p1 = uv + 0.5 * blurdist * blurvec;
    vec2 stepvec = (p1-p0) / float(NUM_SAMPLES);
    vec2 p = p0;
    #if defined(USE_RANDOM)
    p += (hash12n(uv+fract(TIME))-0.5) * stepvec;
    #endif

    vec3 sumcol = vec3(0.0);
    for (int i=0;i<NUM_SAMPLES;++i)
    {
        //if ( p.x < 0.25 )
        //    sumcol += pattern( p ).rgb;
        //else
        //{
            vec3 smpl = srgb2lin((sampletex(p) - THRESHOLD) / (1.0-THRESHOLD));
            sumcol += smpl*smpl; //wtf
        //}
        p += stepvec;
    }
    sumcol /= float(NUM_SAMPLES);
    sumcol = max( sumcol, 0.0 );

    fragColor = vec4( lin2srgb( sumcol * MULT ), 1.0 );
}


void main(void) {
  if(PASSINDEX == 0) {
    pass1(gl_FragColor, gl_FragCoord.xy);
  } else if(PASSINDEX == 1) {
    pass2(gl_FragColor, gl_FragCoord.xy);
  } else {
    gl_FragColor = IMG_THIS_NORM_PIXEL(buffer2);
  }
}