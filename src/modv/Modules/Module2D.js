import Module from './Module';

/**
 * @extends Module
 */
class Module2D extends Module {
  /**
   * @param {ModuleSettings} settings
   */
  constructor(settings) {
    super(settings);

    function render({ canvas, context, video, features, meyda, delta, bpm, kick }) {
      context.save();
      context.globalAlpha = this.info.alpha || 1;
      context.globalCompositeOperation = this.info.compositeOperation || 'normal';
      this.draw({ canvas, context, video, features, meyda, delta, bpm, kick });
      context.restore();
    }

    Object.defineProperty(this, 'render', {
      get() {
        return render.bind(this);
      },
      set() {
        throw new Error('Module2D\'s method "render" cannot be overwritten');
      },
    });
  }

  /**
   * Called each frame to update the Module
   * @param  {HTMLCanvas}               canvas        The Canvas to draw to
   * @param  {CanvasRenderingContext2D} context       The Context of the Canvas
   * @param  {HTMLVideoElement}         video         The video stream requested by modV
   * @param  {Array<MeydaFeatures>}     meydaFeatures Requested Meyda features
   * @param  {Meyda}                    meyda         The Meyda instance
   *                                                  (for Windowing functions etc.)
   *
   * @param  {DOMHighResTimeStamp}      delta         Timestamp returned by requestAnimationFrame
   * @param  {Number}                   bpm           The detected or tapped BPM
   * @param  {Boolean}                  kick          Indicates if BeatDetektor detected a kick in
   *                                                  the audio stream
   */
  draw({ canvas, context, video, features, meyda, delta, bpm, kick }) {} //eslint-disable-line
}

export default Module2D;
