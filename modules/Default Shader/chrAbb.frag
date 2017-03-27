// from here: https://www.shadertoy.com/view/MtXXDr

precision mediump float;
uniform sampler2D u_modVCanvas;
uniform float rOffset; //1.0
uniform float gOffset; //1.015
uniform float bOffset; //1.03
varying vec2 vUv;

void main() {
	//	vec4 rValue = texture2D(u_image, vUv - rOffset);
	//	vec4 gValue = texture2D(u_image, vUv - gOffset);
	//	vec4 bValue = texture2D(u_image, vUv - bOffset);

	//	// Combine the offset colors.
	// gl_FragColor = vec4(rValue.r, gValue.g, bValue.b, texture2D(u_image, vUv).a);

	vec3 refractiveIndex = vec3(rOffset, gOffset, bOffset);
	vec2 normalizedTexCoord = vec2(2.0, 2.0) * vUv - vec2(1.0, 1.0);	// [0, 1] -> [-1, 1]
	vec3 texVec = vec3(normalizedTexCoord, 1.0);
	vec3 normalVec = vec3(0.0, 0.0, -1.0);
	vec3 redRefractionVec = refract(texVec, normalVec, refractiveIndex.r);
	vec3 greenRefractionVec = refract(texVec, normalVec, refractiveIndex.g);
	vec3 blueRefractionVec = refract(texVec, normalVec, refractiveIndex.b);
	vec2 redTexCoord = ((redRefractionVec / redRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);
	vec2 greenTexCoord = ((greenRefractionVec / greenRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);
	vec2 blueTexCoord = ((blueRefractionVec / blueRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);

	gl_FragColor = vec4
	(
		texture2D(u_modVCanvas, redTexCoord).r,
		texture2D(u_modVCanvas, greenTexCoord).g,
		texture2D(u_modVCanvas, blueTexCoord).b,
		texture2D(u_modVCanvas, vUv).a
	);
}