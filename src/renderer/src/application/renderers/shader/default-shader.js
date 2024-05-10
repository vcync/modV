export default {
  v: `
    precision mediump float;

    attribute vec2 position, a_position, a_texCoord;

    varying vec2 vUv;
    varying vec2 fragCoord;

    void main() {
      vUv = vec2(1.0 - position.x, position.y);
      fragCoord = vec2(1.0 - position.x, position.y);
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

  f: `
    precision mediump float;

    uniform vec3      iResolution;           // viewport resolution (in pixels)
    uniform float     iGlobalTime;           // shader playback time (in seconds)
    uniform float     iTimeDelta;            // render time (in seconds)
    uniform float     iTime;                 // render time (in seconds)
    uniform int       iFrame;                // shader playback frame
    uniform float     iChannelTime[4];       // channel playback time (in seconds)
    uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
    uniform vec4      iDate;                 // (year, month, day, time in seconds)
    uniform sampler2D iChannel0;             // Texture #1
    uniform sampler2D iChannel1;             // Texture #2
    uniform sampler2D iChannel2;             // Texture #3
    uniform sampler2D iChannel3;             // Texture #4
    uniform sampler2D u_modVCanvas;          // modV's canvas
    uniform bool      u_kick;                // beatdetektor kick
    uniform sampler2D u_fft;                 // fft texture
    uniform float     u_fftResolution;       // fft texture width


    varying vec2 vUv;

    void main() {
      gl_FragColor=vec4(vUv.x,0.5+0.5*cos(iGlobalTime/1.1),0.5+0.5*sin(iGlobalTime),1.0);
    }`,

  v300: `#version 300 es
    precision mediump float;
    in vec2 position;
    uniform vec3 iResolution;
    uniform float iTime;
    out vec2 vUv;
    void main() {
      vUv = vec2(1.0 - position.x, position.y);
      gl_Position = vec4(1.0 - 2.0 * position, 0, 1);
    }`,

  fWrap: `#version 300 es
    precision mediump float;
    uniform vec3      iResolution;           // viewport resolution (in pixels)
    uniform float     iGlobalTime;           // shader playback time (in seconds)
    uniform float     iTimeDelta;            // render time (in seconds)
    uniform float     iTime;                 // render time (in seconds)
    uniform int       iFrame;                // shader playback frame
    uniform float     iChannelTime[4];       // channel playback time (in seconds)
    uniform vec3      iChannelResolution[4]; // channel resolution (in pixels)
    uniform vec4      iDate;                 // (year, month, day, time in seconds)
    uniform sampler2D iChannel0;             // Texture #1
    uniform sampler2D iChannel1;             // Texture #2
    uniform sampler2D iChannel2;             // Texture #3
    uniform sampler2D iChannel3;             // Texture #4
    uniform sampler2D u_modVCanvas;          // modV's canvas
    uniform bool      u_kick;                // beatdetektor kick
    uniform sampler2D u_fft;                 // fft texture
    uniform float     u_fftResolution;       // fft texture width

    in vec2 vUv;
    out vec4 outColor;

    %MAIN_IMAGE_INJECT%
    void main() {
      vec4 image;
      mainImage(image, gl_FragCoord.xy);
      image.a = 1.;
      outColor = image;
    }`,
};
