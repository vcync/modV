import { webgl } from '@/modv'

let modVCanvasTexture

function render({ Module, canvas, context, pipeline }) {
  const regl = webgl.regl

  if (!modVCanvasTexture) {
    modVCanvasTexture = regl.texture({
      data: canvas,
      mipmap: true,
      wrap: ['mirror', 'mirror'],
      mag: 'linear',
      min: 'linear mipmap linear',
      flipY: Module.meta.flipY
    })
  } else {
    modVCanvasTexture({
      data: canvas,
      mipmap: true,
      wrap: ['mirror', 'mirror'],
      mag: 'linear',
      min: 'linear mipmap linear',
      flipY: Module.meta.flipY
    })
  }

  const uniforms = {
    u_modVCanvas: modVCanvasTexture,
    iChannel0: modVCanvasTexture,
    iChannel1: modVCanvasTexture,
    iChannel2: modVCanvasTexture,
    iChannel3: modVCanvasTexture
  }

  if (Module.props) {
    Object.keys(Module.props).forEach(key => {
      uniforms[key] = Module[key]
    })
  }

  // if ('meyda' in Module.meta) {
  //   if (Module.meta.meyda.length > 0) {
  //     const meydaFeatures = modV.meyda.get(modV.audioFeatures);
  //     Module.meta.meyda.forEach((feature) => {
  //       const uniLoc = gl.getUniformLocation(webgl.programs[webgl.activeProgram], feature);

  //       const value = parseFloat(meydaFeatures[feature]);
  //       gl.uniform1f(uniLoc, value);
  //     });
  //   }
  // }

  regl.clear({
    depth: 1,
    color: [0, 0, 0, 0]
  })

  Module.reglDraw(uniforms)

  context.save()
  context.globalAlpha = Module.meta.alpha || 1
  context.globalCompositeOperation = Module.meta.compositeOperation || 'normal'
  if (pipeline) context.clearRect(0, 0, canvas.width, canvas.height)
  // Copy Shader Canvas to Main Canvas
  context.drawImage(webgl.canvas, 0, 0, canvas.width, canvas.height)

  context.restore()
}

/**
 * Makes a regl program from the given shader files
 *
 * @param  {Object}  A Shader Module definition
 * @return {Promise} Resolves with completion of compiled shaders
 */
function makeProgram(Module) {
  const regl = webgl.regl

  return new Promise((resolve, reject) => {
    // Read shader documents
    let vert = Module.vertexShader
    let frag = Module.fragmentShader

    if (!vert) vert = webgl.defaultShader.v
    if (!frag) frag = webgl.defaultShader.f

    if (frag.search('gl_FragColor') < 0) {
      frag = webgl.defaultShader.fWrap.replace(/(%MAIN_IMAGE_INJECT%)/, frag)

      vert = webgl.defaultShader.v300
    }

    const uniforms = {
      u_modVCanvas: regl.prop('u_modVCanvas'),
      iFrame: ({ tick }) => tick,
      iTime: ({ time }) => time,
      u_delta: ({ time }) => time,
      u_time: ({ time }) => time * 1000,
      iGlobalTime: ({ time }) => time,
      iResolution: ({ viewportWidth, viewportHeight, pixelRatio }) => [
        viewportWidth,
        viewportHeight,
        pixelRatio
      ],
      iChannel0: regl.prop('iChannel0'),
      iChannel1: regl.prop('iChannel1'),
      iChannel2: regl.prop('iChannel2'),
      iChannel3: regl.prop('iChannel3'),
      'iChannelResolution[0]': regl.prop('iChannelResolution[0]'),
      'iChannelResolution[1]': regl.prop('iChannelResolution[1]'),
      'iChannelResolution[2]': regl.prop('iChannelResolution[2]'),
      'iChannelResolution[3]': regl.prop('iChannelResolution[3]')
    }

    if (Module.props) {
      Object.keys(Module.props).forEach(key => {
        uniforms[key] = regl.prop(key)
      })
    }

    try {
      const draw = regl({
        vert,
        frag,

        attributes: {
          position: [-2, 2, 0, -2, 2, 2],
          a_position: [-2, 2, 0, -2, 2, 2]
        },

        uniforms,

        count: 3
      })

      Module.reglDraw = draw
      Module.draw = render
    } catch (e) {
      reject(e)
    }

    resolve(Module)
  }).catch(reason => {
    throw new Error(reason)
  })
}

async function setup(Module) {
  try {
    return await makeProgram(Module)
  } catch (e) {
    throw new Error(e)
  }
}

export { setup, render }
