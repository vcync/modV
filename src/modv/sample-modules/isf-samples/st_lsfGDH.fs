/*
{
  "CATEGORIES" : [
    "zoomer"
  ],
  "DESCRIPTION" : "simple rotozoomer",
  "INPUTS" : [
    {
      "NAME" : "inputImage",
      "TYPE" : "image"
    }
  ],
  "ISFVSN" : "2",
  "CREDIT" : "triggerHLM "
}
*/

float pi = 3.14159265;

vec4 mainImage( vec2 fragCoord ) {
  float time= TIME * 0.2;

  vec2 position = vec2(640.0/2.0+640.0/2.0*sin(time*2.0), 360.0/2.0+360.0/2.0*cos(time*3.0));
  vec2 position2 = vec2(640.0/2.0+640.0/2.0*sin((time+2000.0)*2.0), 360.0/2.0+360.0/2.0*cos((time+2000.0)*3.0));


  vec2 offset = vec2(640.0/2.0, 360.0/2.0) ;
  vec2 offset2 = vec2(6.0*sin(time*1.1), 3.0*cos(time*1.1));

  vec2 oldPos = (fragCoord.xy);

  float angle = time*2.0;

  vec2 newPos = vec2(oldPos.x *cos(angle) - oldPos.y *sin(angle),
    oldPos.y *cos(angle) + oldPos.x *sin(angle));


  newPos = (newPos)*(0.0044+0.004*sin(time*3.0))-offset2;
  vec2 temp = newPos;
  newPos.x = temp.x + 0.4*sin(temp.y*2.0+time*8.0);
  newPos.y = (-temp.y + 0.4*sin(temp.x*2.0+time*8.0));
  vec4 final = IMG_NORM_PIXEL(inputImage, newPos);
  return final;
}

void main(void) {
  gl_FragColor = mainImage(gl_FragCoord.xy);
}