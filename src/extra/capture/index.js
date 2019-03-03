import CCapture from 'ccapture.js'
import controlPanelComponent from './ControlPanel'

const capture = {
  name: 'Capture',
  controlPanelComponent,

  capturer: new CCapture({
    verbose: true,
    framerate: 60,
    motionBlurFrames: 16,
    quality: 90,
    format: 'webm'
  }),

  on() {
    this.capturer = new CCapture({
      verbose: true,
      framerate: 60,
      motionBlurFrames: 16,
      quality: 90,
      format: 'webm'
    })
  },

  off() {
    if (!this.capturer) return

    this.capturer.stop()
    this.capturer.save()
  },

  processFrame({ canvas }) {
    this.capturer.capture(canvas)
  }
}

export default capture
