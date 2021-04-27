/*{
  "DESCRIPTION": "This commented shader explains how transform the camera rays so that the output is rendered in equirectangular or fisheye format.  Can be used in domes or other immersive environments. Hold mouse for equirectangular view and move mouse to rotate camera. ",
  "CREDIT": "WilstonOreo",
  "CATEGORIES": [
    "dome",
    "raymarching",
    "tutorial",
    "fisheye",
    "equirectangular"
  ],
  "INPUTS": [
    {
      "LABEL": "Mouse X",
      "NAME": "mX",
      "TYPE": "float",
      "DEFAULT": 0.5,
      "MIN": 0.0,
      "MAX": 1.0
    },
    {
      "LABEL": "Mouse Y",
      "NAME": "mY",
      "TYPE": "float",
      "DEFAULT": 0.5,
      "MIN": 0.0,
      "MAX": 1.0
    },
    {
      "LABEL": "Mouse Z",
      "NAME": "mZ",
      "TYPE": "float",
      "DEFAULT": 0.5,
      "MIN": 0.0,
      "MAX": 1.0
    },
    {
      "LABEL": "Mouse W",
      "NAME": "mW",
      "TYPE": "float",
      "DEFAULT": 0.5,
      "MIN": 0.0,
      "MAX": 1.0
    }
  ]
}*/

vec3 iResolution = vec3(RENDERSIZE, 1.);
vec4 iMouse = vec4(mX*RENDERSIZE.x, mY*RENDERSIZE.y, mZ*RENDERSIZE.x, mW*RENDERSIZE.y);
float iTime = TIME;

// Licensed under Creative Commons 3.0 Share Alike License
// Based on dila's ray marching tutorial:
// https://www.shadertoy.com/view/XdKGWm

// (C) 2016-2017 by WilstonOreo http://omnido.me


#define MAP_EQUIRECTANGULAR 0
#define MAP_FISHEYE 1

// Display equirectangular view when clicked.

const float speed = 0.5;


int map_mode() {
    return (iMouse.w > 0.0) ? MAP_FISHEYE : MAP_EQUIRECTANGULAR;
}


// Camera rotation with mouse

float camera_yaw() {
  return iMouse.x / iResolution.x * 360.0;
}

float camera_pitch() {
  return iMouse.y / iResolution.y * 360.0;
}


const float camera_roll = 0.0;
const float sphere_size = 0.25;


//////////////////////////////////////////////////
// Code section for spherical translation

const float PI = 3.14159265358979323846264;

/// Convert degrees to radians
float deg2rad(in float deg)
{
  return deg * PI / 180.0;
}

/// Calculates the rotation matrix of a rotation around X axis with an angle in radians
mat3 rotateAroundX( in float angle )
{
  float s = sin(angle);
  float c = cos(angle);
  return mat3(1.0,0.0,0.0,
              0.0,  c, -s,
              0.0,  s,  c);
}

// Calculates the rotation matrix of a rotation around Y axis with an angle in radians
mat3 rotateAroundY( in float angle )
{
  float s = sin(angle);
  float c = cos(angle);
  return mat3(  c,0.0,  s,
              0.0,1.0,0.0,
               -s,0.0,  c);
}

// Calculates the rotation matrix of a rotation around Z axis with an angle in radians
mat3 rotateAroundZ( in float angle )
{
  float s = sin(angle);
  float c = cos(angle);
  return mat3(  c, -s,0.0,
                s,  c,0.0,
              0.0,0.0,1.0);
}

// Calculate rotation by given yaw and pitch angles (in degrees!)
mat3 rotationMatrix(in float yaw, in float pitch, in float roll)
{
  return rotateAroundZ(deg2rad(yaw)) *
         rotateAroundY(deg2rad(-pitch)) *
         rotateAroundX(deg2rad(roll));
}

// Get fisheye camera ray from screen coordinates
#ifdef MAP_FISHEYE
float fisheye_direction(out vec3 rd)
{
  // Move screen coordinates to the center, so
  // it is bound to [-0.5,-0.5] and [0.5,0.5]
  vec2 uv = gl_FragCoord.xy / iResolution.xy - vec2(0.5);

  // Calculate polar coordinates (angle phi and length)
  float phi = atan(uv.x,uv.y);
  float l = length(uv);

  if (l > 0.5)
  {
    // Return -1.0 because the calculated polar coordinates are
    // outside the half sphere
    return -1.0;
  }

  // Calculate ray direction
  float theta  = l * PI;
  rd = normalize(vec3(sin(theta)*cos(phi),sin(theta)*sin(phi),cos(theta)));

  // Formulas are on wikipedia:
  // https://en.wikipedia.org/wiki/Polar_coordinate_system
  return 1.0;
}
#endif


// Calculate camera ray in equirectangular direction from screen coordinates
#ifdef MAP_EQUIRECTANGULAR
float equirectangular_direction(out vec3 rd)
{
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  // Calculate azimuthal and polar angles from screen coordinates
  float theta =  uv.t * PI,
        phi =  uv.s * 2.0 * PI;

  // Calculate ray directions from polar and azimuthal angle
  rd = vec3(sin(theta) * cos(phi), sin(theta) * sin(phi), cos(theta));

  // formulas are on wikipedia:
  // https://en.wikipedia.org/wiki/Spherical_coordinate_system
  return 1.0;
}
#endif


// Calculate camera ray direction in equirectangular
float direction(out vec3 rd)
{
  // Select mapping mode based on input parameter
#ifdef MAP_EQUIRECTANGULAR
  if (map_mode() == MAP_EQUIRECTANGULAR)
  {
    return equirectangular_direction(rd);
  }
#endif
#ifdef MAP_FISHEYE
  if (map_mode() == MAP_FISHEYE)
  {
    return fisheye_direction(rd);
  }
#endif
  return -1.0;
}


// Calculate camera ray with rotation
float direction(float roll, float pitch, float yaw, out vec3 rd)
{
  if (direction(rd) < 0.0)
  {
    return -1.0;
  }
  // Rotate the ray direction to have camera rotation with
  // pitch, yaw and roll angles
  rd *= rotateAroundZ(yaw)*rotateAroundY(pitch)*rotateAroundX(roll);
  return 1.0;
}

// END Code section for spherical translation
//////////////////////////////////////////////////



//////////////////////////////////////////////////
// Code section from dila's raymarch tutorial


// Output resolution

// Current TIME

//map function, core of all the ray marching shaders. They return a scalar value, given a 3D point.
float map(vec3 p){
    //instancing:
    // you transform the space so it's a repeating coordinate system
    vec3 q = fract(p) * 2.0 -1.0;

    //sphere map function is the length of the point minus the radius
    //it's negative on the inside of the sphere and positive on the outside and 0 on the surface.
    float radius = sphere_size;
  return length(q) - radius;
}

//we use a numerical marching algorithim called trace
//o = origin
//r = ray to march along
//t = intersection along the ray
float trace(vec3 o, vec3 r){
    float t = 0.0;
    for (int i =0; i <32; i++){
        //origin + ray*t = where we are along the ray;
        // we step along the ray in variable length segments,
      vec3 p = o+r*t;
        //until we gradual converge on the intersection and evaluate the map function at that point
        float d=map(p);
        //we add that to t
        // the smaller the 0.5 value, the less accurate the map function is
        t += d * 0.5;
    }
     return t;
}

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{

    ////////////////////////////////////////
    // This commented out code section explains how setup
    // a camera ray for standard perspective camera.
    // For a fisheye or equirectangular camera, this is different.
    // The calculation is done in the equirectangular_direction or
    // fisheye_direction function.
  // vec2 uv = fragCoord.xy / iResolution.xy;
    //transform the cordinates to -1 to 1, instead of 0 to 1
    // uv = uv * 2.0 - 1.0;
    // correct the aspect ratio
    // uv.x *= iResolution.x / iResolution.y;

    //r = ray
    // it needs to be normalized so it doesn't poke through the geometry when it's really close to the camera
    //the z cordinate is 1.0, that's how you project the 2D coordinate into 3D space,
    //you just decide the z value, which determines the field of view of the camera
    // smaller z = higher fov. 1.0 = 90 degrees
    //vec3 r = normalize(vec3(uv,1.0));

    //rotation around the y axis
    //you have to look up on wikipedia what this is
    // float the= iTime*.25;
    //r.xz *= mat2(cos(the), -sin(the), sin(the), cos(the));
    // END of commented out section for generating a perspective view camera ray
    ////////////////////////////////////////

    // Spherical ray generation code
    // This is entry point where the generation of
    // camera ray in spherical direction happens!
    /////////////////////////////////////////////////
    vec3 r;
    // Calculate ray direction with camera rotation
    if (direction(
        deg2rad(camera_roll),
        deg2rad(camera_pitch()),
        deg2rad(camera_yaw()),r) != 1.0) {
      // Transparent pixel if ray direction is not valid for screen coordinates
      fragColor = vec4(0.0,0.0,0.0,0.0);
      return;
    }

    // the sphere is at (0.0,0.0,0.0)
    vec3 o = vec3(0.0,0.0, iTime);

    //trace from the origin along the ray to find the intersection from our map function
    float t = trace(o, r);
    // simple fogging funcition to darken things the further away they are
    float fog = 1.0 / (1.0 + t * t * 0.1);

    vec3 fc = vec3(fog);

  fragColor = vec4(fc,1.0);
}




void main(void) {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}