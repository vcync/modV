/*{
	"CREDIT": "by sheltron3030",
	"DESCRIPTION": "",
	"CATEGORIES": [
		"XXX"
	],
	"INPUTS": [
		{
			"NAME": "noise",
			"TYPE": "image"
		},
		{
			"NAME" : "termThres",
			"TYPE" : "float",
			"DEFAULT" :5,
			"MIN" : 0,
			"MAX" : 10
		},
		{
			"NAME" : "step_p",
			"TYPE" : "float",
			"DEFAULT" :0.5,
			"MIN" : 0,
			"MAX" : 1
		},
		{
			"NAME" : "rot_z",
			"TYPE" : "float",
			"DEFAULT" :0.5,
			"MIN" : 0,
			"MAX" : 6.28
		},
		{
			"NAME" : "squiggle",
			"TYPE" : "float",
			"DEFAULT" : 0.5,
			"MIN" : -1,
			"MAX" : 1
		},
		{
			"NAME" : "repeat",
			"TYPE" : "float",
			"DEFAULT" : 0.5,
			"MIN" : -1,
			"MAX" : 5
		},
		{
			"NAME" : "speed",
			"TYPE" : "float",
			"DEFAULT" : 0.5,
			"MIN" : -1,
			"MAX" : 2
		},
		{
			"NAME" : "hex_1",
			"TYPE" : "float",
			"DEFAULT" : 0.5,
			"MIN" : 0,
			"MAX" : 1
		},
		{
			"NAME" : "hex_2",
			"TYPE" : "float",
			"DEFAULT" : 0.5,
			"MIN" : 0,
			"MAX" : 1
		},
		{
			"NAME" : "hex_depth",
			"TYPE" : "float",
			"DEFAULT" : 0.5,
			"MIN" : 0,
			"MAX" : 1
		},
		{
			"NAME" : "offset_cam",
			"TYPE" : "float",
			"DEFAULT" : 0,
			"MIN" : -1,
			"MAX" : 1
		}
	],
	"PERSISTENT_BUFFERS": [
		"buffer"
	],
	"PASSES": [
		{
			"TARGET" : "buffer"
		},
		{ }
	]
}*/

#define MAX_ITER 40

vec3 filter() {
	vec2 delta = 1. / RENDERSIZE;
	
	vec3 val = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy).xyz;


	vec3 l = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy + vec2(0., delta.y)).xyz;
	vec3 r = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy - vec2(0., delta.y)).xyz;
	vec3 u = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy + vec2(delta.x, 0.)).xyz;
	vec3 d = IMG_NORM_PIXEL(buffer, vv_FragNormCoord.xy - vec2(delta.x, 0.)).xyz;

	vec3 n = IMG_NORM_PIXEL(noise, fract(vv_FragNormCoord.xy * 2. + TIME )).xyz - 0.5;
	
	vec3 bloom = max(val, max(max(l, r), max( u, d))) * 1.5;
	// bloom = bloom  + l + r + u + d;
	// bloom /= 5.; // orlando;
	return bloom + n/9.;

}

			mat3 rotationMatrix(vec3 axis, float angle) {
			    float s = sin(angle);
			    float c = cos(angle);
			    float oc = 1.0 - c;
			    
			    return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
			                oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
			                oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c);
			}

			vec3 opRep( vec3 p, vec3 c )
			{
			    vec3 q = mod(p, c) - 0.5 * c;
			    
			    return q;
			}

			float sdCappedCylinder( vec3 p, vec2 h )
			{
			  vec2 d = abs(vec2(length(p.xz),p.y)) - h;
			  return min(max(d.x,d.y),0.0) + length(max(d,0.0));
			}
			
			float opS( float d1, float d2 )
			{
			    return max(-d1,d2);
			}

			float hex(vec3 p, vec2 h) {
				vec3 q = abs(p);
				return max(q.z-h.y, max((q.x*0.866025+q.y*0.5),q.y) - h.x);
			}
			float sdTriPrism( vec3 p, vec2 h )
			{
			    vec3 q = abs(p);
			    return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
			}
			vec2 polar(vec2 c) {
				return vec2(atan(c.y, c.x), length(c));
			}
			vec2 cart(vec2 p) {
				return p.y * vec2(cos(p.x), sin(p.x));
			}



vec2 DE(vec3 pos) {

	pos = pos * rotationMatrix(normalize(vec3(0., 0., 1.)), rot_z + TIME/10. + squiggle * sin(pos.z) );
	
	// pos -= vec3(0., sin(TIME), cos(TIME));
	pos = opRep(pos, vec3(repeat));
	

	pos.xy = polar(pos.xy);
	pos.x += 5.;
	 pos.xy = cart(pos.xy);

	float a = hex(pos, vec2(hex_1 * repeat,  hex_depth/2.));
	float b = hex(pos, vec2(hex_2 * hex_1 * repeat, hex_depth));

	// float b = sdTriPrism(pos - vec3(-1., 0., 0.), vec2(0.6, 1.));
	float c = sdTriPrism(pos - vec3(0., 0., 0.), vec2(0.6, 1.));

	float d =  max(a,-b);

	return vec2(pos.z, d);
}

vec3 gradient(vec3 p, float t) {
			vec2 e = vec2(0., t);

			return normalize( 
				vec3(
					DE(p+e.yxx).y - DE(p-e.yxx).y,
					DE(p+e.xyx).y - DE(p-e.xyx).y,
					DE(p+e.xxy).y - DE(p-e.xxy).y
				)
			);
		}

vec3 palette( in float t)
{
	vec3 a = vec3(1.4, 0.5, 0.5);
	vec3 b = vec3(0.8, 0.3, 0.3);
	vec3 c = vec3(1.31, 1.3, 0.1);
	vec3 d = vec3(0.50, 0.20, 1.6);
	
    return a + b*cos( 6.28318*(c*t+d) );
}

vec3 raycast() {
	
	vec3 camera = vec3( 0., 0., TIME * speed );
	vec2 screenPos = -1.0 + 2.0 * gl_FragCoord.xy /RENDERSIZE;
	screenPos.x *= RENDERSIZE.x / RENDERSIZE.y;
	vec2 n = IMG_NORM_PIXEL(noise, fract(vv_FragNormCoord.xy + TIME * 10.)).xy - 0.5;
	
	// screenPos += n/100.;
	vec3 ray = normalize(vec3( screenPos, 1.0));
	float thresh = exp(-termThres);

	
	// raycasting parameter	
	float t  = 0.;
	vec3 point;
	int iter = 0;
 	bool hit = false;
 	vec2 dist;
	// ray stepping 
	for(int i = 0; i < MAX_ITER; i++) {
		point = camera + ray * t;
		 dist = DE(point);

		thresh = exp(-termThres) * exp(t/4.);
	
		if (abs(dist.y) < thresh ) {
			hit = true;
			break;
		}
		
			        
		t += dist.y * step_p ;
		iter ++;

	}
			    
	float shade = dot(gradient(point, 0.01 ), -ray);
	float ao = 1. -  float(iter) / float(MAX_ITER);
	
	vec3 color = vec3(0.);
	
	if ( hit )
		color = palette(point.z/5.) * sqrt(ao);
	return color;


}

void main() {


		if (PASSINDEX == 0) {
			gl_FragColor = vec4(raycast(), 1.0);
			
		} else if (PASSINDEX == 1) {
			gl_FragColor = vec4(filter(), 1.0);
		}

	
}