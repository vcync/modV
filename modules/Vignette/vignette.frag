// https://www.shadertoy.com/view/lsKSWR

uniform float intensity;
uniform float extension;

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
	vec2 uv = fragCoord.xy / iResolution.xy;
	uv *=  1.0 - uv.yx;   //vec2(1.0)- uv.yx; -> 1.-u.yx; Thanks FabriceNeyret !
	float vig = uv.x*uv.y * intensity; // multiply with sth for intensity
	vig = pow(vig, extension); // change pow for modifying the extend of the  vignette
	fragColor = vec4(texture(u_modVCanvas, vUv).rgb*(clamp(vig, 0., 1.)),1.0);
}