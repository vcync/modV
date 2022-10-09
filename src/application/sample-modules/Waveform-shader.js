import waveformFrag from "./Waveform-shader.frag";

export default {
  meta: {
    name: "Waveform & FFT",
    author: "inigo quilez",
    version: "1.0.0",
    previewWithOutput: true,
    type: "shader"
  },
  fragmentShader: waveformFrag
};
