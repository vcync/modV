const EventEmitter2 = require('eventemitter2').EventEmitter2;
const shaderInit = require('./shader-env');
const threeInit = require('./three-env');
const MM = require('./media-manager');
require('./fragments/array-contains');
require('script-loader!../libraries/beatdetektor.js');


/**
 * modV
 * @extends {EventEmitter2}
 */
class ModV extends EventEmitter2 {
	constructor(options) {
		super();

		this.printCopyrights();

		/** @const {string} */
		this.version = require('../package.json').version;

		/**
		 * Init audiosystem
		 * @see set-media-source.js
		 */
		/** @type {AudioContext} */
		this.audioContext = null;
		/** @type {AnalyserNode} */
		this.analyserNode = null;
		/** @type {MediaStreamAudioSourceNode} */
		this.audioStream = null;
		/** @type {GainNode} */
		this.gainNode = null;
		/** @type {boolean} */
		this.mediaSourcesInited = false;

		/** @type {Document} */
		this.templates = this.importTemplates();

		// Load user options
		if(typeof options !== 'undefined') this.options = options;

		if(!this.options.controlDomain) this.options.controlDomain = location.protocol + '//' + location.host;

		this.baseURL = this.options.baseURL || '';

		// Attach message handler for sockets and windows
		this.addMessageHandler();

		// Layers store
		this.layers = [];
		this.activeLayer = 0;

		this.activeModules = {};
		this.layerSelectors = [];
		this.LFOs = [];
		this.modOrder = [];
		this.moduleStore = {};
		this.mediaSelectors = [];
		this.outputWindows = [];
		this.profileSelectors = [];
		this.registeredMods = {};
		this.workers = {};

		this.videoStream = document.createElement('video');
		this.videoStream.autoplay = true;
		this.videoStream.muted = true;

		// MIDI
		this.MIDIInstance = new this.MIDI(this);
		this.MIDIInstance.start();

		// Remote
		this.remoteConnect();

		this.canvas = this.options.canvas || document.createElement('canvas');
		this.context = this.canvas.getContext('2d');

		this.width = 0;
		this.height = 0;
		this.pixelRatio = 1.0;

		this.previewCanvas = document.createElement('canvas');
		this.previewContext = this.previewCanvas.getContext('2d');

		this.bufferCanvas = document.createElement('canvas');
		this.bufferContext = this.bufferCanvas.getContext('2d');

		document.querySelector('.canvas-preview').appendChild(this.previewCanvas);
		this.addOutputWindowButtonHandler();

		this.outputCanvas = document.createElement('canvas');
		this.outputContext = this.outputCanvas.getContext('2d');

		this.previewCanvasImageValues = {
			x: 0,
			y: 0,
			width: 0,
			height: 0
		};

		this.addLayer(this.canvas, this.context, false);

		// Clipboard store
		this.copiedValue = null;

		// Robots
		this.bots = {};

		// Window resize
		this.getLargestWindow = require('./get-largest-window');
		this.resize = require('./resize');

		window.addEventListener('resize', () => {
			this.mainWindowResize();
		});

		// Create Windows
		this.createWindow();

		// Collection of palette controls
		this.palettes = new Map();
		this.presets = {};
		this.profiles = {};

		this.mediaManager = new MM(this);

		this.meydaFeatures = ['complexSpectrum'];
		this.activeFeatures = {};

		this.bpm = 0;
		this.bpmHold = false;
		this.bpmHeldAt = 120;
		this.useDetectedBPM = true;

		// Set up BeatDetektor
		this.beatDetektor = new BeatDetektor(85,169);
		this.beatDetektorKick = new BeatDetektor.modules.vis.BassKick();
		this.kick = false;

		// Set up THREE
		this.threeEnv = threeInit();

		// Shader handling
		this.shaderEnv = shaderInit(this);

		// Store all available Media inputs
		this.mediaStreamSources = {
			video: [],
			audio: []
		};

		this.setupWorkers();

		this.emit('ready');
	}

	addOutputWindowButtonHandler() {
		const button = document.querySelector('.canvas-preview-output');
		if (button === null) {
			return;
		}

		button.addEventListener('click', this.outputWindowButtonHandler.bind(this));
	}

	/** @param {MouseEvent} evt */
	outputWindowButtonHandler(evt) {
		const largestWindow = this.getLargestWindow();
		if (largestWindow === null) {
			return;
		}

		if (largestWindow.window && typeof largestWindow.window.focus === 'function') {
			largestWindow.window.focus();
		}
	}

	printCopyrights() {
		const copyrightStrings = ['      modV Copyright  (C)  2017 Sam Wray      ',
															'----------------------------------------------',
															'      modV is licensed  under GNU GPL V3      ',
															'This program comes with ABSOLUTELY NO WARRANTY',
															'For details, see http://localhost:3131/LICENSE',
															'----------------------------------------------'];
		console.log(copyrightStrings.join('\n'));
	}

	/** Saves current modV options to localStorage */
	saveOptions() {
		localStorage.setItem(ModV.LOCAL_STORAGE_KEY, JSON.stringify(this.options)); 
	}

	/** Loads options from localStorage and append non-existing keys to current modV options */
	loadOptions() {
		const savedOptionsValue = localStorage.getItem(ModV.LOCAL_STORAGE_KEY);
		if (savedOptionsValue) {
			const savedOptions = JSON.parse(savedOptionsValue);
			this.options = Object.assign(savedOptions, this.options);
		}
	}

	/** 
	 * UI Templates importing
	 * @todo Use another way to import templates
	 *   because HTML imports currently in Working Draft status
	 * @return {Document} imported document, not usual Document object
	 */
	importTemplates() {
		return document.getElementById('app_templates').import;
	}
}

ModV.LOCAL_STORAGE_KEY = 'modVoptions';

module.exports = ModV;