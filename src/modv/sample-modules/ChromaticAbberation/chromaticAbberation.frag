// from here: https://www.shadertoy.com/view/MtXXDr

precision mediump float;
uniform float rOffset; //1.0
uniform float gOffset; //1.015
uniform float bOffset; //1.03

void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
    vec3 refractiveIndex = vec3(rOffset, gOffset, bOffset);
    vec2 uv = vUv;
    vec2 normalizedTexCoord = vec2(2.0, 2.0) * uv - vec2(1.0, 1.0);    // [0, 1] -> [-1, 1]
    vec3 texVec = vec3(normalizedTexCoord, 1.0);
    vec3 normalVec = vec3(0.0, 0.0, -1.0);
    vec3 redRefractionVec = refract(texVec, normalVec, refractiveIndex.r);
    vec3 greenRefractionVec = refract(texVec, normalVec, refractiveIndex.g);
    vec3 blueRefractionVec = refract(texVec, normalVec, refractiveIndex.b);
    vec2 redTexCoord = ((redRefractionVec / redRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);
    vec2 greenTexCoord = ((greenRefractionVec / greenRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);
    vec2 blueTexCoord = ((blueRefractionVec / blueRefractionVec.z).xy + vec2(1.0, 1.0)) / vec2(2.0, 2.0);

    fragColor = vec4
    (
        texture(u_modVCanvas, redTexCoord).r,
        texture(u_modVCanvas, greenTexCoord).g,
        texture(u_modVCanvas, blueTexCoord).b,
        texture(u_modVCanvas, vUv).a
    );
}