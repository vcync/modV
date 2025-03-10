/*{
  "DESCRIPTION": "Fiddling with Abstract Corridor",
  "CREDIT": "WilstonOreo",
  "CATEGORIES": [
    "tunnel",
    "trianglenoise"
  ],
  "INPUTS": [
    {
      "NAME": "modifier",
      "TYPE": "float",
      "MIN": -2.0,
      "MAX": 2.0,
      "DEFAULT": 1.0
    }
  ]
}*/

vec3 iResolution = vec3(RENDERSIZE, 1.);
float iTime = TIME;

#define PI 3.1415926535898

// Non-standard vec3-to-vec3 hash function.
vec3 hash33(vec3 p){

    float n = sin(dot(p, vec3(7, 157, 113)));
    return fract(vec3(2097152, 262144, 32768)*n);
}

// 2x2 matrix rotation.
mat2 rot2(float a){

    float c = cos(a); float s = sin(a);
  return mat2(c, s, -s, c);
}

// The triangle function that Shadertoy user Nimitz has used in various triangle noise demonstrations.
// See Xyptonjtroz - Very cool. Anyway, it's not really being used to its full potential here.
vec3 tri(in vec3 x){return abs(x-floor(x)-.5);} // Triangle function.


float surfFunc(in vec3 p){

  return dot(tri(p*0.75 + tri(p*0.4).yzx), vec3(0.5 + 0.4*clamp(3.0*sin(iTime*0.72+5.21),-1.0,1.0)));
}
vec2 path(in float z){ float s = sin(z/24.)*cos(z/3.); return vec2(s*12., -s*6.0); }

// Standard tunnel distance function with some perturbation thrown into the mix. A floor has been
// worked in also. A tunnel is just a tube with a smoothly shifting center as you traverse lengthwise.
// The walls of the tube are perturbed by a pretty cheap 3D surface function.
float map(vec3 p){

    // Square tunnel.
    // For a square tunnel, use the Chebyshev(?) distance: max(abs(tun.x), abs(tun.y))
    vec2 tun = abs(p.xy - path(p.z))*vec2(0.5 + 0.1* clamp(60.0*sin(iTime*0.04),-1.0,1.0));
    float n = 1.- max(tun.x, tun.y) + (0.6-surfFunc(p));
    return n;
}

// Surface normal.
vec3 getNormal(in vec3 p) {

  const float eps = 0.001;
  return normalize(vec3(
    map(vec3(p.x+eps,p.y,p.z))-map(vec3(p.x-eps,p.y,p.z)),
    map(vec3(p.x,p.y+eps,p.z))-map(vec3(p.x,p.y-eps,p.z)),
    map(vec3(p.x,p.y,p.z+eps))-map(vec3(p.x,p.y,p.z-eps))
  ));

}


// Cool curve function, by Shadertoy user, Nimitz.
//
// I think it's based on a discrete finite difference approximation to the continuous
// Laplace differential operator? Either way, it gives you the curvature of a surface,
// which is pretty handy.
//
// From an intuitive sense, the function returns a weighted difference between a surface
// value and some surrounding values. Almost common sense... almost. :) If anyone
// could provide links to some useful articles on the function, I'd be greatful.
//
// Original usage (I think?) - Xyptonjtroz: https://www.shadertoy.com/view/4ts3z2
float curve(in vec3 p, in float w){

    vec2 e = vec2(-1., 1.)*w;

    float t1 = map(p + e.yxx), t2 = map(p + e.xxy);
    float t3 = map(p + e.xyx), t4 = map(p + e.yyy);

    return 1.0/(w*w+0.004) *(t1 + t2 + t3 + t4 - 4.*map(p));
}

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
  iTime = iTime * modifier;

  // Screen coordinates.
  vec2 uv = (fragCoord - iResolution.xy*0.5)/iResolution.y;

  // Camera Setup.
  vec3 lookAt = vec3(0.0, 0.0, iTime);  // "Look At" position.
  vec3 camPos = lookAt + vec3(0.0, 0.1, -0.5); // Camera position, doubling as the ray origin.

    // Light positioning. One is a little behind the camera, and the other is further down the tunnel.
  vec3 light_pos = camPos + vec3(0.0, 0.125, -0.125);// Put it a bit in front of the camera.

  // Using the Z-value to perturb the XY-plane.
  // Sending the camera, "look at," and two light vectors down the tunnel. The "path" function is
  // synchronized with the distance function. Change to "path2" to traverse the other tunnel.
  lookAt.xy += path(lookAt.z);
  camPos.xy += path(camPos.z);
  light_pos.xy += path(light_pos.z);

    // Using the above to produce the unit ray-direction vector.
    float FOV = PI/3.; // FOV - Field of view.
    vec3 forward = normalize(lookAt-camPos);
    vec3 right = normalize(vec3(forward.z, 0., -forward.x ));
    vec3 up = cross(forward, right);

    // rd - Ray direction.
    vec3 rd = normalize(forward + FOV*uv.x*right + FOV*uv.y*up);

    // Swiveling the camera from left to right when turning corners.
    rd.xy *= rot2( -path(lookAt.z).x/32. );

    // Standard ray marching routine. I find that some system setups don't like anything other than
    // a "break" statement (by itself) to exit.
  float t = 0.0, dt;
  for(int i=0; i<64; i++){
    dt = map(camPos + rd*t);
    if( t>150.){ break; }
    t += dt*0.75;
  }

    // The final scene color. Initated to black.
  vec3 sceneCol = vec3(0.);

  // The ray has effectively hit the surface, so light it up.
  if(dt<0.005){

      t += dt;

      // Surface position and surface normal.
      vec3 sp = t * rd+camPos;
      vec3 sn = getNormal(sp);

      // Light direction vectors.
      vec3 ld = light_pos-sp;

        // Distance from respective lights to the surface point.
      float distlpsp = max(length(ld)*0.1, 2.0);


      // Normalize the light direction vectors.
      ld /= distlpsp;
      // Light attenuation, based on the distances above.
      float atten = min(1./(distlpsp), 1.);

      // Ambient light.
      float ambience = 0.25;

      // Diffuse lighting.
      float diff = max( dot(sn, ld), 0.0);


      // Specular lighting.
      float spec = pow(max( dot( reflect(-ld, sn), -rd ), 0.0 ), 8.);

      // Curvature.
      float crv = clamp(curve(sp, 0.125)*0.5+0.5, .0, 1.);

      // Fresnel term. Good for giving a surface a bit of a reflective glow.
        float fre = pow( clamp(dot(sn, rd) + 1., .0, 1.), 0.1);

      // Darkening the crevices. Otherwise known as cheap, scientifically-incorrect shadowing.
      float shading =  crv*0.5+0.5;

      // Combining the above terms to produce the final color. It was based more on acheiving a
        // certain aesthetic than science.
        //
        // Glow.

        // Shading.

        float gridValue = clamp(4.0*cos(iTime*0.412),-1.0,1.0);

        sceneCol = atten * vec3( fre*crv*4. ) * vec3(0.1*-gridValue,0.8+0.3 * gridValue,1.0 * - gridValue);

        // Drawing the lines on the walls. Comment this out and change the first texture to
        // granite for a granite corridor effect.
        sceneCol *= clamp((gridValue + 1.0 )*abs(curve(sp, 0.0125)) - gridValue * (1.0 - abs(curve(sp, 0.0125))), .0, 1.);


  }

  fragColor = vec4(clamp(sceneCol, 0., 1.), 1.0);

}

void main(void) {
    mainImage(gl_FragColor, gl_FragCoord.xy);
}