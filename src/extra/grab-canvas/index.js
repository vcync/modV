/* eslint-disable */

import store from '@/store'
import { modV } from 'modv'
import controlPanelComponent from './ControlPanel'
import grabCanvasStore from './store'

const Worker = require('worker-loader!./worker.js'); //eslint-disable-line

/**
 * A module to grab data from the modVs output canvas to put it on
 * it's own "smallCanvas" (which is very small in terms of size to improve peformance)
 * and then send the pixel-data to luminave (https://github.com/NERDDISCO/luminave)
 * luminave is using the data to control other kind of lights (for example DMX512)
 *
 * @param{number} width - Width of the smallCanvas
 * @param{number} height - Height of the smallCanvas
 * @param{number} selectionX - Amount of areas we select on the x-axis
 * @param{number} selectionY - Amount of areas we select on the y-axis
 */
const theWorker = new Worker()

// Small version of the output canvas
const smallCanvas = document.createElement('canvas')
const smallContext = smallCanvas.getContext('2d')
const smallCanvasWidth = 5
const smallCanvasHeight = 5
// Keep it low to improve performance
const fps = 15

// Add the canvas to modV for testing purposes :D
smallCanvas.classList.add('is-hidden')
smallCanvas.style = `position: absolute; top: 0px; right: 0px; width: 200px;
height: 200px; z-index: 100000; background: #000;`
document.body.appendChild(smallCanvas)

const smallGrid = document.createElement('div')
smallGrid.classList.add('is-hidden')
document.body.appendChild(smallGrid)

let selectionX = 0
let selectionY = 0

// Is the plugin active?
let isActive = true

let data = new Uint8ClampedArray(smallCanvasWidth * smallCanvasHeight * 4)

let lastUpdate = Date.now()

const grabCanvas = {
  name: 'Grab Canvas',
  controlPanelComponent,
  store: grabCanvasStore,

  presetData: {
    save() {
      return store.state.grabCanvas
    },

    load(data) {
      const { selectionX, selectionY, url } = data

      store.commit('grabCanvas/setSelection', { selectionX, selectionY })
      store.commit('grabCanvas/setUrl', { url })
    }
  },

  on() {
    isActive = true

    // Close the WebSocket connection
    theWorker.postMessage({
      type: 'startConnection'
    })
  },

  off() {
    isActive = false

    // Close the WebSocket connection
    theWorker.postMessage({
      type: 'closeConnection'
    })
  },

  /**
   * When the canvas is resized: Update the worker.
   *
   * @param{Object} canvas - The modV output canvas
   */
  resize(canvas) {
    if (!canvas) return

    theWorker.postMessage({
      type: 'setupCanvas',
      payload: {
        width: smallCanvas.width,
        height: smallCanvas.height,
        selectionX: store.state.grabCanvas.selectionX,
        selectionY: store.state.grabCanvas.selectionY
      }
    })
  },

  /**
   * Only called when added to modV.
   */
  install() {
    isActive = true

    // Set the size of the smallCanvas
    smallCanvas.width = smallCanvasWidth
    smallCanvas.height = smallCanvasHeight

    store.subscribe(mutation => {
      switch (mutation.type) {
        case 'windows/setSize':
          this.resize({
            width: mutation.payload.width,
            height: mutation.payload.height
          })
          break

        case 'grabCanvas/setSelection':
          selectionX =
            mutation.payload.selectionX || store.state.grabCanvas.selectionX
          selectionY =
            mutation.payload.selectionY || store.state.grabCanvas.selectionY

         this.drawGrid()

          theWorker.postMessage({
            type: 'setupCanvas',
            payload: {
              width: smallCanvas.width,
              height: smallCanvas.height,
              selectionX:
                mutation.payload.selectionX ||
                store.state.grabCanvas.selectionX,
              selectionY:
                mutation.payload.selectionY || store.state.grabCanvas.selectionY
            }
          })
          break

        case 'grabCanvas/setUrl':
          theWorker.postMessage({
            type: 'setupConnection',
            payload: {
              url: mutation.payload.url || store.state.grabCanvas.url,
              active: isActive
            }
          })
          break

        case 'grabCanvas/setShowCanvas':
          smallCanvas.classList.toggle('is-hidden')
          smallGrid.classList.toggle('is-hidden')
          break

        default:
          break
      }
    })

    this.resize(modV.outputCanvas)

    // Create the WebSocket connection
    theWorker.postMessage({
      type: 'setupConnection',
      payload: {
        url: store.state.grabCanvas.url,
        active: isActive
      }
    })
  },

  /**
   * Called once every frame.
   * Allows access of each frame drawn to the screen.
   *
   * @param{Object} canvas - The modV output canvas
   */
  processFrame({ canvas, context }) {
    const now = Date.now()

    // Limit the data per second for luminave
    if (now - lastUpdate > 1000 / fps) {
      lastUpdate = now

      // Clear the output
      smallContext.clearRect(0, 0, smallCanvas.width, smallCanvas.height)

      // Create a small version of the canvas
      smallContext.drawImage(
        canvas,
        0,
        0,
        smallCanvas.width,
        smallCanvas.height
      )

      // Get the pixels from the small canvas
      data = smallContext.getImageData(
        0,
        0,
        smallCanvasWidth,
        smallCanvasHeight
      ).data
      
      // Send the data to the worker
      theWorker.postMessage(
        {
          type: 'data',
          payload: data
        },
        [data.buffer]
      )
    }
  },

    /**
   * Draw the areas that are used to calculate the average color per area into the smallCanvas
   */
  drawGrid() {
    const sizeX = Math.floor(200 / selectionX)
    const sizeY = Math.floor(200 / selectionY)

    smallGrid.style = `position: absolute; background-size: 200px 200px; top: 0px;  right: 0px; width: 200px; height: 200px; z-index: 100001; background-image: repeating-linear-gradient(0deg,transparent,transparent ${sizeX}px, #CCC ${sizeX}px,#CCC ${sizeX + 1}px),repeating-linear-gradient(-90deg,transparent,transparent ${sizeY}px,#CCC ${sizeY}px,#CCC ${sizeY + 1}px);`
  }
}

export default grabCanvas
