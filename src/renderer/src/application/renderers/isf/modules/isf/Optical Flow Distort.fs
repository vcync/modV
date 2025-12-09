/*{
  "DESCRIPTION": "Uses an optical flow mask to create a distortion",
  "CREDIT": "by VIDVOX, based on original implementation by Andrew Benson and v002",
  "CATEGORIES": [
    "Distortion Effect"
  ],
  "INPUTS": [
    {
      "NAME": "inputImage",
      "TYPE": "image"
    },
    {
      "NAME": "amt",
      "LABEL": "Distortion Amount",
      "TYPE": "float",
      "MIN": 0,
      "MAX": 1,
      "DEFAULT": 0.5
    },
    {
      "NAME": "maskHold",
      "LABEL": "Flow Persistence",
      "TYPE": "float",
      "MIN": 0,
      "MAX": 1,
      "DEFAULT": 0.98
    },
    {
      "NAME": "inputScale",
      "LABEL": "Scale",
      "TYPE": "float",
      "MIN": 0,
      "MAX": 10,
      "DEFAULT": 2
    },
    {
      "NAME": "inputOffset",
      "LABEL": "Offset",
      "TYPE": "float",
      "MIN": 0,
      "MAX": 1,
      "DEFAULT": 0.1
    },
    {
      "NAME": "inputLambda",
      "LABEL": "Noise Removal",
      "TYPE": "float",
      "MIN": 0,
      "MAX": 1,
      "DEFAULT": 1
    }
  ],
  "PASSES": [
    {
      "TARGET": "maskBuffer",
      "persistent": true
    },
    {
      "TARGET": "delayBuffer",
      "persistent": true
    },
    {}
  ]
}*/


varying vec2 left_coord;
varying vec2 right_coord;
varying vec2 above_coord;
varying vec2 below_coord;

varying vec2 lefta_coord;
varying vec2 righta_coord;
varying vec2 leftb_coord;
varying vec2 rightb_coord;


//	based on v002 Optical Flow which is itself a port of Andrew Bensons HS Flow implementation on the GPU.
//	https://github.com/v002/v002-Optical-Flow


const vec4 coeffs = vec4(0.2126, 0.7152, 0.0722, 1.0);

float gray(vec4 n)
{
	return (n.r + n.g + n.b)/3.0;
}

void main()
{
	//	on the first pass generate the mask using the previous delayBuffer and inputImage
	//	on the 2nd pass update the delayBuffer to hold inputImage
	//	on the 3rd pass output the new mask
	if (PASSINDEX == 0)	{
		//	convert to grayscale
		vec4 a = IMG_THIS_PIXEL(inputImage) * coeffs;
		float brightness = gray(a);
		a = vec4(brightness);
		vec4 b = IMG_THIS_PIXEL(delayBuffer) * coeffs;
		brightness = gray(b);
		b = vec4(brightness);
		
		vec2 x1 = vec2(inputOffset * RENDERSIZE.x, 0.0);
		vec2 y1 = vec2(0.0,inputOffset * RENDERSIZE.y);
		vec2 texcoord0 = isf_FragNormCoord.xy * RENDERSIZE;
		vec2 texcoord1 = isf_FragNormCoord.xy * RENDERSIZE;
		
		//get the difference
		vec4 curdif = b-a;
	
		//calculate the gradient
		vec4 gradx = IMG_PIXEL(delayBuffer, texcoord1+x1)-IMG_PIXEL(delayBuffer, texcoord1-x1);
		gradx += IMG_PIXEL(inputImage, texcoord0+x1)-IMG_PIXEL(inputImage, texcoord0-x1);
	
		vec4 grady = IMG_PIXEL(delayBuffer, texcoord1+y1)-IMG_PIXEL(delayBuffer, texcoord1-y1);
		grady += IMG_PIXEL(inputImage, texcoord0+y1)-IMG_PIXEL(inputImage, texcoord0-y1);
	
		vec4 gradmag = sqrt((gradx*gradx)+(grady*grady)+vec4(inputLambda));

		vec4 vx = curdif*(gradx/gradmag);
		float vxd = gray(vx);//assumes greyscale
		//format output for flowrepos, out(-x,+x,-y,+y)
		vec2 xout = vec2(max(vxd,0.),abs(min(vxd,0.)))*inputScale;

		vec4 vy = curdif*(grady/gradmag);
		float vyd = gray(vy);//assumes greyscale
		//format output for flowrepos, out(-x,+x,-y,+y)
		vec2 yout = vec2(max(vyd,0.),abs(min(vyd,0.)))*inputScale;
	
		vec4 mask = clamp(vec4(xout.xy,yout.xy), 0.0, 1.0);
		
		vec4 color = IMG_THIS_NORM_PIXEL(maskBuffer);
		vec4 colorL = IMG_NORM_PIXEL(maskBuffer, left_coord);
		vec4 colorR = IMG_NORM_PIXEL(maskBuffer, right_coord);
		vec4 colorA = IMG_NORM_PIXEL(maskBuffer, above_coord);
		vec4 colorB = IMG_NORM_PIXEL(maskBuffer, below_coord);

		vec4 colorLA = IMG_NORM_PIXEL(maskBuffer, lefta_coord);
		vec4 colorRA = IMG_NORM_PIXEL(maskBuffer, righta_coord);
		vec4 colorLB = IMG_NORM_PIXEL(maskBuffer, leftb_coord);
		vec4 colorRB = IMG_NORM_PIXEL(maskBuffer, rightb_coord);

		//	blur the feedback buffer
		vec4 blurVector = (color + colorL + colorR + colorA + colorB + colorLA + colorRA + colorLB + colorRB) / 9.0;
		gl_FragColor = mask + maskHold * blurVector;
	}
	else if (PASSINDEX == 1)	{	
		//	here we just buffer the current frame for next time
		gl_FragColor = IMG_THIS_PIXEL(inputImage);
	}
	else	{
		//	NOW DO SOMETHING WITH THE MASK - BLUR THE IMAGE AND THE MASK IMAGE
		
		//	blur the mask image
		vec2 texcoord0 = isf_FragNormCoord.xy;
		
		vec4 color = IMG_THIS_NORM_PIXEL(maskBuffer);
		vec4 colorL = IMG_NORM_PIXEL(maskBuffer, left_coord);
		vec4 colorR = IMG_NORM_PIXEL(maskBuffer, right_coord);
		vec4 colorA = IMG_NORM_PIXEL(maskBuffer, above_coord);
		vec4 colorB = IMG_NORM_PIXEL(maskBuffer, below_coord);

		vec4 colorLA = IMG_NORM_PIXEL(maskBuffer, lefta_coord);
		vec4 colorRA = IMG_NORM_PIXEL(maskBuffer, righta_coord);
		vec4 colorLB = IMG_NORM_PIXEL(maskBuffer, leftb_coord);
		vec4 colorRB = IMG_NORM_PIXEL(maskBuffer, rightb_coord);
		
		vec4 blurVector = (color + colorL + colorR + colorA + colorB + colorLA + colorRA + colorLB + colorRB) / 9.0;
		//vec4 blurVector = IMG_THIS_PIXEL(maskBuffer);
		
		vec2 blurAmount = vec2(blurVector.y-blurVector.x, blurVector.w-blurVector.z);
		vec2 tmp = texcoord0 + blurAmount * amt;
		tmp.x = clamp(tmp.x,0.0,1.0);
		tmp.y = clamp(tmp.y,0.0,1.0);
		vec4 sample0 = IMG_NORM_PIXEL(inputImage, tmp);
		tmp = (1.02 + texcoord0) + blurAmount * amt * amt;
		tmp.x = clamp(tmp.x,0.0,1.0);
		tmp.y = clamp(tmp.y,0.0,1.0);
		vec4 sample1 = IMG_NORM_PIXEL(inputImage, tmp);
		gl_FragColor = (sample0 * 3.0 + sample1) / 4.0;
	}
}
