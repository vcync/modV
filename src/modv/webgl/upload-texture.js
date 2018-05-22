import { webgl } from '@/modv';

export default function uploadTexture(texture) {
  const gl = webgl.gl;

  // Copy Main Canvas to Shader texture
  webgl.texture = gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    texture,
  );
  if (webgl.useMipmap) gl.generateMipmap(gl.TEXTURE_2D);
}
