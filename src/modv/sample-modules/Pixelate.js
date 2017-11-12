import { Module2D } from '../Modules';

class Pixelate extends Module2D {
  constructor() {
    super({
      info: {
        name: 'Pixelate',
        author: '2xAA',
        version: 0.1,
        previewWithOutput: true,
        meyda: ['rms', 'zcr'],
      },
    });

    const controls = [];

    controls.push({
      type: 'rangeControl',
      variable: 'pixelAmount',
      label: 'Amount',
      varType: 'int',
      min: 2,
      max: 30,
      step: 1,
      default: 5,
    });

    controls.push({
      type: 'checkboxControl',
      variable: 'soundReactive',
      label: 'Sound Reactive',
      checked: false,
    });

    controls.push({
      type: 'rangeControl',
      variable: 'intensity',
      label: 'RMS/ZCR Intensity',
      varType: 'int',
      min: 0,
      max: 30,
      step: 1,
      default: 15,
    });

    controls.push({
      type: 'checkboxControl',
      variable: 'soundType',
      label: 'RMS (unchecked) / ZCR (checked)',
      checked: false,
    });

    this.add(controls);
  }

  init(canvas) {
    this.soundReactive = false;
    this.soundType = false; // false RMS, true ZCR
    this.intensity = 15; // Half max
    this.pixelAmount = 5;

    this.newCanvas2 = document.createElement('canvas');
    this.newCtx2 = this.newCanvas2.getContext('2d');
    this.newCtx2.imageSmoothingEnabled = false;

    this.newCanvas2.width = canvas.width;
    this.newCanvas2.height = canvas.height;
  }

  resize(canvas) {
    this.newCanvas2.width = canvas.width;
    this.newCanvas2.height = canvas.height;
  }

  draw({ canvas, context, features }) {
    let w;
    let h;
    let analysed;

    if (this.soundReactive) {
      if (this.soundType) {
        analysed = features.zcr / (10 * this.intensity);
      } else {
        analysed = (features.rms * 10) * this.intensity;
      }

      w = canvas.width / analysed;
      h = canvas.height / analysed;
    } else {
      w = canvas.width / this.pixelAmount;
      h = canvas.height / this.pixelAmount;
    }

    context.save();
    this.newCtx2.clearRect(0, 0, this.newCanvas2.width, this.newCanvas2.height);
    context.imageSmoothingEnabled = false;
    this.newCtx2.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, w, h);
    context.drawImage(this.newCanvas2, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
    context.restore();
  }
}

export default Pixelate;
