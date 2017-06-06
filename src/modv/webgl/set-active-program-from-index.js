import { webgl } from '@/modv';

export default function setActiveProgramFromIndex(program) {
  const gl = webgl.gl;

  if(webgl.activeProgram === program) return;
  webgl.activeProgram = program;
  gl.useProgram(webgl.programs[program]);
}