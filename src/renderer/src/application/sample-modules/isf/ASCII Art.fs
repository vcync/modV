/*{
	"DESCRIPTION": "ASCII Art",
	"CREDIT": "by IMIMOT (Ported from https://www.shadertoy.com/view/lssGDj)",
	"CATEGORIES": [
		"Stylize"
	],
	"INPUTS": [
		{
			"NAME": "inputImage",
			"TYPE": "image"
		},
		{
			"NAME": "amount",
			"TYPE": "float",
			"DEFAULT": 0.0
		}
	]
	
}*/

float character(float n, vec2 p) // some compilers have the word "char" reserved
{
	p = floor(p*vec2(4.0, -4.0) + 2.5);
	if (clamp(p.x, 0.0, 4.0) == p.x && clamp(p.y, 0.0, 4.0) == p.y)
	{
		if (int(mod(n/exp2(p.x + 5.0*p.y), 2.0)) == 1) return 1.0;
	}	
	return 0.0;
}



void main()	{
	float _amount = amount*36.0+8.0;
	vec2 uv = gl_FragCoord.xy;
	vec3 col = IMG_NORM_PIXEL(inputImage, (floor(uv/_amount)*_amount/RENDERSIZE.xy)).rgb;
	
	
	float gray = (col.r + col.g + col.b)/3.0;
	
	float n =  65536.0;             // .
	if (gray > 0.2) n = 65600.0;    // :
	if (gray > 0.3) n = 332772.0;   // *
	if (gray > 0.4) n = 15255086.0; // o 
	if (gray > 0.5) n = 23385164.0; // &
	if (gray > 0.6) n = 15252014.0; // 8
	if (gray > 0.7) n = 13199452.0; // @
	if (gray > 0.8) n = 11512810.0; // #
		
	vec2 p = mod(uv/(_amount/2.0), 2.0) - vec2(1.0);
	col = col*character(n, p);	
	gl_FragColor = vec4(col, 1.0);

}
