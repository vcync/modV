export default {
  v: // '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
    // 'precision highp float;\n' +
    // '#else\n' +
    'precision mediump float;\n' +
    // '#endif\n' +
    'attribute vec2 a_position,a_texCoord;' +
    'uniform vec3 iResolution;' +
    'varying vec2 fragCoord;' +
    'varying vec2 vUv;' +
    'void main() {' +
      'vec2 zeroToOne=a_position/iResolution.xy,zeroToTwo=zeroToOne*2.,clipSpace=zeroToTwo-1.;' +
      'gl_Position=vec4(clipSpace*vec2(1,-1),0,1);' +
      'fragCoord=a_position;' +
      'vUv=zeroToOne;' +
    '}',

  f: // '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
    // 'precision highp float;\n' +
    // '#else\n' +
    'precision mediump float;\n' +
    // '#endif\n' +
    'uniform sampler2D u_modVCanvas;' +
    'uniform vec3 iResolution;' +
    'uniform float iGlobalTime;' +
    'uniform float iTime;' +
    'varying vec2 vUv;' +
    'void main() {' +
      'gl_FragColor=vec4(vUv.x,0.5+0.5*cos(iGlobalTime/1.1),0.5+0.5*sin(iGlobalTime),1.0);' +
    '}',

  v300: '#version 300 es\n' +
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
    'precision highp float;\n' +
    '#else\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'in vec2 a_position,a_texCoord;' +
    'uniform vec3 iResolution;' +
    'uniform float iTime;' +
    'out vec2 fragCoord;' +
    'out vec2 vUv;' +
    'void main() {' +
      'vec2 zeroToOne=a_position/iResolution.xy,zeroToTwo=zeroToOne*2.,clipSpace=zeroToTwo-1.;' +
      'gl_Position=vec4(clipSpace*vec2(1,-1),0,1);' +
      'fragCoord=a_position;' +
      'vUv=zeroToOne;' +
    '}',

  fWrap:
    '#version 300 es\n' +
    '#ifdef GL_FRAGMENT_PRECISION_HIGH\n' +
    'precision highp float;\n' +
    '#else\n' +
    'precision mediump float;\n' +
    '#endif\n' +
    'uniform sampler2D u_modVCanvas;' +
    'uniform vec3 iResolution;' +
    'uniform float iGlobalTime;' +
    'uniform float iTime;' +
    'in vec2 vUv;' +
    'in vec2 fragCoord;\n' +
    'out vec4 outColor;' +
    '%MAIN_IMAGE_INJECT%\n\n' +
    'void main() {' +
      'mainImage(outColor, fragCoord);' +
    '}',
};
