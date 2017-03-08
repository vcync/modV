const shaderInit = require('./shader-env');
const threeInit = require('./three-env');
const MM = require('./media-manager');
require('./fragments/array-contains');
require('script-loader!../libraries/beatdetektor.js');

var modV = function(options) {

	console.log('      modV Copyright  (C)  2017 Sam Wray      '+ "\n" +
				'----------------------------------------------'+ "\n" +
				'      modV is licensed  under GNU GPL V3      '+ "\n" +
				'This program comes with ABSOLUTELY NO WARRANTY'+ "\n" +
				'For details, see http://localhost:3131/LICENSE'+ "\n" +
				'----------------------------------------------');

	this.version = require('../package.json').version;

	this.saveOptions = require('./option-storage').save;
	this.loadOptions = require('./option-storage').load;

	// Audio
	this.audioContext = null;
	this.analyserNode = null; 
	this.audioStream = null;
	this.gainNode = null;
	this.muted = true;
	this.ready = false;

	// UI Templates
	this.templates = document.querySelector('link[rel="import"]').import;

	// Load user options
	if(typeof options !== 'undefined') this.options = options;

	if(!this.options.controlDomain) this.options.controlDomain = location.protocol + '//' + location.host;

	this.baseURL = this.options.baseURL || '';

	// Attach message handler for sockets and windows
	this.addMessageHandler();

	this.activeModules = {};
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

	// Layers store
	this.layers = [];
	this.activeLayer = 0;

	this.canvas = this.options.canvas || document.createElement('canvas');
	this.context = this.canvas.getContext('2d');

	this.width = 0;
	this.height = 0;

	this.previewCanvas = document.createElement('canvas');
	this.previewContext = this.previewCanvas.getContext('2d');

	this.bufferCanvas = document.createElement('canvas');
	this.bufferContext = this.bufferCanvas.getContext('2d');

	document.querySelector('.canvas-preview').appendChild(this.previewCanvas);

	this.outputCanvas = document.createElement('canvas');
	this.outputContext = this.outputCanvas.getContext('2d');

	this.previewCanvasImageValues = {
		x: 0,
		y: 0,
		width: 0,
		height: 0
	};

	this.addLayer(this.canvas, this.context, false);

	this.soloCanvas = undefined;

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
};

module.exports = modV;