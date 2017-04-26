/* globals Sortable, $ */

const attachResizeHandles = require('./ui-resize/attach');
const ContextMenuHandler = require('./context-menu-handler');
const initContextMenus = require('./context-menus');
const Menu = require('nwjs-menu-browser');
require('../node_modules/nwjs-menu-browser/dist/nwjs-menu-browser.css');

if(!window.nw) {
	var nw = {};
	nw.Menu = Menu.Menu;
	nw.MenuItem = Menu.MenuItem;
} else {
	var nw = window.nw;
}

module.exports = function(modV) {
	modV.prototype.startUI = function() {
		var self = this;

		// ContextMenu handler
		this.ContextMenuHandler = new ContextMenuHandler();
		this.menus = {};
		this.menus.addHook = this.ContextMenuHandler.addHook;

		Object.defineProperty(this.menus, 'contextMenuEvent', {
			get: () => {
				return this.ContextMenuHandler.contextMenuEvent;
			}
		});

		Object.defineProperty(this.menus, 'contextMenuTarget', {
			get: () => {
				return this.ContextMenuHandler.contextMenuTarget;
			}
		});

		initContextMenus.bind(this)();

		// simplebar
		$('.active-list-wrapper').simplebar({ wrapContent: false });
		$('.gallery-wrapper').simplebar({ wrapContent: false });

		self.mainWindowResize();

		var gallery = document.getElementsByClassName('gallery')[0];
		var list = document.getElementsByClassName('active-list')[0];
		self.currentActiveDrag = null;

		Sortable.create(list, {
			group: {
				name: 'layers',
				pull: true,
				put: true
			},
			handle: '.handle',
			chosenClass: 'chosen',
			onEnd: function(evt) {
				self.moveLayerToIndex(evt.oldIndex, evt.newIndex);
			}
		});

		Sortable.create(gallery, {
			group: {
				name: 'modV',
				pull: 'clone',
				put: false
			},
			draggable: '.gallery-item',
			sort: false
		});

		// Handle module removal (not using sortable because of api limitations with clone elements between lists)
		gallery.addEventListener('drop', function(e) {
			e.preventDefault();
			var droppedModuleData = e.dataTransfer.getData('modulename');

			self.currentActiveDrag  = null;

			forIn(self.activeModules, (moduleName, Module) => {
				if(Module.info.safeName === droppedModuleData) {
					self.deleteActiveModule(Module);
				}
			});
		});

		gallery.addEventListener('dragover', function(e) {
			e.preventDefault();
			if(!self.currentActiveDrag) return;

			self.currentActiveDrag.classList.add('deletable');
		});

		gallery.addEventListener('dragleave', function(e) {
			e.preventDefault();
			if(!self.currentActiveDrag) return;

			self.currentActiveDrag.classList.remove('deletable');
		});

		window.addEventListener('focusin', activeElementHandler);
		window.addEventListener('focusout', clearActiveElement);

		function clearPanels() {
			var panels = document.querySelectorAll('.control-panel');

			// :^) hacks hacks hacks
			[].forEach.call(panels, function(panel) {
				panel.classList.remove('show');
			});

		}

		function clearCurrent() {
			var activeItems = document.querySelectorAll('.active-item');

			// :^) hacks hacks hacks
			[].forEach.call(activeItems, function(activeItemNode) {
				if(activeItemNode) activeItemNode.classList.remove('current');
			});
		}

		function activeElementHandler(evt) {
			var eventNode = evt.srcElement.closest('.active-item');
			if(!eventNode) return;

			clearCurrent();
			eventNode.classList.add('current');

			var dataName = eventNode.dataset.moduleName;
			var panel = document.querySelector('.control-panel[data-module-name="' + dataName + '"]');

			clearPanels();
			panel.classList.add('show');
		}

		function clearActiveElement() {
			// empty
		}

		// Create Global Controls
		var template = self.templates.querySelector('#global-controls');
		var globalControlPanel = document.importNode(template.content, true);

		document.querySelector('.global-control-panel-wrapper').appendChild(globalControlPanel);

		// Pull back initialised node from DOM
		globalControlPanel = document.querySelector('.global-control-panel-wrapper .global-controls');

		globalControlPanel.querySelector('#detectBPMGlobal').addEventListener('change', function() {
			self.useDetectedBPM = this.checked;
		});

		tapTempo.on('tempo', function(tempo){
			self.updateBPM(tempo);
		});

		globalControlPanel.querySelector('#BPMtapperGlobal').addEventListener('click', function() {
			tapTempo.tap();
		});

		let retinaCheckbox = globalControlPanel.querySelector('#retinaGlobal');

		retinaCheckbox.checked = self.options.retina;

		retinaCheckbox.addEventListener('change', function() {
			self.options.retina = this.checked;
			self.resize();
			self.mainWindowResize();
		});

		globalControlPanel.querySelector('#monitorAudioGlobal').addEventListener('change', function() {
				if(this.checked) {
					self.gainNode.gain.value = 1;
				} else {
					self.gainNode.gain.value = 0;
				}
		});

		this.enumerateSourceSelects();

		var audioSelectNode = document.querySelector('#audioSourceGlobal');
		var videoSelectNode = document.querySelector('#videoSourceGlobal');

		audioSelectNode.addEventListener('change', function() {
			self.setMediaSource(this.value, videoSelectNode.value);
		});

		videoSelectNode.addEventListener('change', function() {
			self.setMediaSource(audioSelectNode.value, this.value);
		});

		globalControlPanel.querySelector('#factoryResetGlobal').addEventListener('click', function() {
			self.factoryReset();
		});

		globalControlPanel.querySelector('#newOutputWindowGlobal').addEventListener('click', () => self.createWindow());

		globalControlPanel.querySelector('#setUsername').value = self.options.user;

		globalControlPanel.querySelector('#setUsernameGlobal').addEventListener('click', function() {
			self.setName(globalControlPanel.querySelector('#setUsername').value);
		});

		let chooser = globalControlPanel.querySelector('#selectMediaFolderGlobal');

		chooser.addEventListener('change', function() {
			if(this.value.trim().length > 0) {
				self.mediaManager.sendJSON({request: 'set-folder', folder: this.value});
			}
		}, false);

		globalControlPanel.querySelector('#selectMediaFolderButtonGlobal').addEventListener('click', function() {
			chooser.click();
		});

		// Attach UI resize handles
		attachResizeHandles(this);

		// Layer menu
		var addLayerButton = document.querySelector('.add-layer');
		addLayerButton.addEventListener('click', function() {
			self.addLayer();
		});

		function findAncestor (el, cls) {
			while ((el = el.parentElement) && !el.classList.contains(cls));
			return el;
		}

		list.addEventListener('mousedown', e => {
			// find ancestor
			let ancestor = findAncestor(e.target, 'layer-item');

			if(e.target.classList.contains('layer-item') || ancestor) return;
			self.layers.forEach(Layer => {
				Layer.getNode().classList.remove('active');
			});
		});

		var trashLayerButton = document.querySelector('.trash-layer');
		trashLayerButton.addEventListener('click', function() {
			let Layer = self.layers[self.activeLayer];
			let activeLayer = document.querySelector('.layer-item.active');
			if(Layer && activeLayer) self.removeLayer(Layer);
		});

		// Create Layer Controls
		let layerTemplate = self.templates.querySelector('#layer-controls');
		let layerControlPanel = document.importNode(layerTemplate.content, true);

		document.querySelector('.layer-control-panel-wrapper').appendChild(layerControlPanel);

		// Pull back initialised node from DOM
		layerControlPanel = document.querySelector('.layer-control-panel-wrapper .layer-controls');

		layerControlPanel.querySelector('#clearingLayers').addEventListener('click', function() {
			self.layers[self.activeLayer].clearing = this.checked;
		});

		layerControlPanel.querySelector('#inheritLayers').addEventListener('click', function() {
			self.layers[self.activeLayer].inherit = this.checked;
		});

		layerControlPanel.querySelector('#pipeLineLayers').addEventListener('click', function() {
			self.layers[self.activeLayer].pipeline = this.checked;
		});

		layerControlPanel.querySelector('#outputLayers').addEventListener('click', function() {
			self.layers[self.activeLayer].drawToOutput = this.checked;
		});

		let inheritanceSelect = self.LayerSelector({
			onchange: function(index) {
				self.layers[self.activeLayer].inheritFrom = parseInt(index);
			}
		});

		layerControlPanel.querySelector('.inherit-group').appendChild(inheritanceSelect.returnHTML());

		this.updateLayerControls();

		// Create Preset Controls
		let presetTemplate = self.templates.querySelector('#preset-controls');
		let presetControlPanel = document.importNode(presetTemplate.content, true);

		document.querySelector('.preset-control-panel-wrapper').appendChild(presetControlPanel);

		// Pull back initialised node from DOM
		presetControlPanel = document.querySelector('.preset-control-panel-wrapper .preset-controls');

		let loadPresetclearScreenCheckbox = presetControlPanel.querySelector('#loadPresetClearScreen');

		let loadPresetLockedLayersCheckbox = presetControlPanel.querySelector('#loadPresetLockedLayers');

		presetControlPanel.querySelector('#loadPreset').addEventListener('click', function() {
			self.loadPreset(presetControlPanel.querySelector('#loadPresetSelect').value, loadPresetclearScreenCheckbox.checked, loadPresetLockedLayersCheckbox.checked);
		});

		presetControlPanel.querySelector('#savePreset').addEventListener('click', function() {
			self.savePreset(presetControlPanel.querySelector('#savePresetName').value, 'default');
		});

		// Tabs for right-side controls
		let rightTabs = this.TabController();
		rightTabs = new rightTabs(); //jshint ignore:line
		rightTabs.add('Layer', document.querySelector('.layer-control-panel-wrapper'), true);
		rightTabs.add('Global', document.querySelector('.global-control-panel-wrapper'));
		rightTabs.add('Presets', document.querySelector('.preset-control-panel-wrapper'));

		let rightControls = document.querySelector('.main-control-area');

		rightControls.insertBefore(rightTabs.tabBar(), rightControls.firstChild);
	};
};