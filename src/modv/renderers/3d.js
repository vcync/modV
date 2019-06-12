import * as THREE from 'three'
import store from '../../store'

const threeEnv = {}

threeEnv.textureCanvas = document.createElement('canvas')
threeEnv.textureCanvasContext = threeEnv.textureCanvas.getContext('2d')

threeEnv.texture = new THREE.Texture(threeEnv.textureCanvas)
threeEnv.texture.minFilter = THREE.LinearFilter

threeEnv.material = new THREE.MeshBasicMaterial({
  map: threeEnv.texture,
  side: THREE.DoubleSide
})

threeEnv.renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
})

threeEnv.renderer.setPixelRatio(window.devicePixelRatio)
threeEnv.canvas = threeEnv.renderer.domElement

function render(RenderContext) {
  const { canvas, context, Module } = RenderContext

  let texture = threeEnv.texture

  // copy current canvas to our textureCanvas, clear first
  threeEnv.textureCanvasContext.clearRect(0, 0, canvas.width, canvas.height)
  threeEnv.textureCanvasContext.drawImage(
    canvas,
    0,
    0,
    canvas.width,
    canvas.height
  )

  // threeEnv.material.map = threeEnv.texture;
  threeEnv.material.map.needsUpdate = true

  Module.draw({
    scene: Module.getScene(),
    camera: Module.getCamera(),
    material: threeEnv.material,
    texture,
    THREE,
    ...RenderContext
  })

  threeEnv.renderer.render(Module.getScene(), Module.getCamera())

  context.save()
  context.globalAlpha = Module.meta.alpha || 1
  context.globalCompositeOperation = Module.meta.compositeOperation || 'normal'
  context.drawImage(threeEnv.canvas, 0, 0, canvas.width, canvas.height)
  context.restore()
}

async function setup(Module) {
  return new Promise(resolve => {
    Module._scene = new THREE.Scene()
    Module._camera = null

    Module.setScene = scene => {
      Module._scene = scene
    }

    Module.getScene = () => {
      return Module._scene
    }

    Module.setCamera = camera => {
      Module._camera = camera
    }

    Module.getCamera = () => {
      return Module._camera
    }

    Module.getMaterial = () => {
      return threeEnv.material
    }

    resolve(Module)
  })
}

const initVars = {
  THREE
}

store.subscribe(({ type, payload }) => {
  if (type === 'size/setDimensions') {
    const { width, height } = payload

    let newWidth = width
    let newHeight = height

    if (store.state.user.useRetina) {
      newWidth = width * window.devicePixelRatio
      newHeight = height * window.devicePixelRatio
    }

    threeEnv.textureCanvas.width = newWidth
    threeEnv.textureCanvas.height = newHeight
    threeEnv.renderer.setSize(newWidth, newHeight)
  }
})

export { setup, render, initVars }
