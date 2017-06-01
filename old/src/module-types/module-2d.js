const Module = require('./module');

module.exports = function(modV) {

	/**
	 * @extends Module
	 */
	class Module2D extends Module {

		/**
		 * @param {ModuleSettings} settings
		 */
		constructor(settings) {
			super(settings);
		}

		/**
		 * Called each frame to update the Module
		 * @param  {HTMLCanvas}               canvas        The Canvas to draw to
		 * @param  {CanvasRenderingContext2D} context       The Context of the Canvas
		 * @param  {HTMLVideoElement}         video         The video stream requested by modV
		 * @param  {Array<MeydaFeatures>}     meydaFeatures Requested Meyda features
		 * @param  {Meyda}                    meyda         The Meyda instance (for Windowing functions etc.)
		 * @param  {DOMHighResTimeStamp}      delta         Timestamp returned by requestAnimationFrame
		 * @param  {Number}                   bpm           The detected or tapped BPM
		 * @param  {Boolean}                  kick          Indicates if BeatDetektor detected a kick in the audio stream
		 */
		draw(canvas, context, video, meydaFeatures, meyda, delta, bpm, kick) {} //jshint ignore:line
	}

	/**
	 * @name Module2D
	 * @memberOf modV
	 * @type {Module2D}
	 */
	modV.prototype.Module2D = Module2D;
};