/* globals Sortable, swapElements */
(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.startUI = function() {
		var self = this;

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
			onAdd: function(evt) {
				/*// Dragged HTMLElement
				var itemEl = evt.item;
				// Cloned element
				var clone = gallery.querySelector('.gallery-item[data-module-name="' + itemEl.dataset.moduleName + '"]');

				var layer = 0;

				// Get Module
				var oldModule = self.registeredMods[replaceAll(itemEl.dataset.moduleName, '-', ' ')];

				var Module = self.createModule(oldModule);

				if(evt.originalEvent.shiftKey) {
					Module.info.solo = true;
				}

				// Move back to gallery
				swapElements(clone, itemEl);

				var activeItemNode = self.createActiveListItem(Module, function(node) {
					self.currentActiveDrag = node;
				}, function() {
					self.currentActiveDrag  = null;
				});

				// Replace clone
				try {
					list.replaceChild(activeItemNode, clone);	
				} catch(e) {
					return;
				}

				// Add to active registry
				self.activeModules[Module.info.name] = Module;

				// Add to layer
				self.layers[layer].addModule(Module, evt.newIndex);

				//self.setModOrder(Module.info.name, evt.newIndex);

				// Create controls
				self.createControls(Module, self);

				activeItemNode.focus();*/
			},
			onEnd: function(evt) {
				self.swapLayers(evt.oldIndex, evt.newIndex);
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


		globalControlPanel.querySelector('#clearingGlobal').addEventListener('change', function() {
			self.clearing = this.checked;
		});

		globalControlPanel.querySelector('#monitorAudioGlobal').addEventListener('change', function() {
				if(this.checked) {
					self.gainNode.gain.value = 1;
				} else {
					self.gainNode.gain.value = 0;
				}
		});

		var audioSelectNode = globalControlPanel.querySelector('#audioSourceGlobal');
		var videoSelectNode = globalControlPanel.querySelector('#videoSourceGlobal');

		// Set up media sources
		self.mediaStreamSources.audio.forEach(function(audioSource) {
			var optionNode = document.createElement('option');
			optionNode.value = audioSource.id;
			optionNode.textContent = audioSource.label;

			if(audioSource.id === self.options.audioSource) {
				optionNode.selected = true;
			}
			audioSelectNode.appendChild(optionNode);
		});

		self.mediaStreamSources.video.forEach(function(videoSource) {
			var optionNode = document.createElement('option');
			optionNode.value = videoSource.id;
			optionNode.textContent = videoSource.label;
			
			if(videoSource.id === self.options.videoSource) {
				optionNode.selected = true;
			}
			videoSelectNode.appendChild(optionNode);
		});

		audioSelectNode.addEventListener('change', function() {
			self.setMediaSource(this.value, videoSelectNode.value);
		});

		videoSelectNode.addEventListener('change', function() {
			self.setMediaSource(audioSelectNode.value, this.value);
		});

		globalControlPanel.querySelector('#factoryResetGlobal').addEventListener('click', function() {
			self.factoryReset();
		});

		globalControlPanel.querySelector('#savePresetGlobal').addEventListener('click', function() {
			self.savePreset(globalControlPanel.querySelector('#savePresetName').value, 'default');
		});

		globalControlPanel.querySelector('#setUsername').value = self.options.user;

		globalControlPanel.querySelector('#setUsernameGlobal').addEventListener('click', function() {
			self.setName(globalControlPanel.querySelector('#setUsername').value);
		});

		// finds the offset of el from the body or html element
		function getAbsoluteOffsetFromBody( el ) {
			var _x = 0;
			var _y = 0;
			while( el && !isNaN( el.offsetLeft ) && !isNaN( el.offsetTop ) ) {
				_x += el.offsetLeft - el.scrollLeft + el.clientLeft;
				_y += el.offsetTop - el.scrollTop + el.clientTop;
				el = el.offsetParent;
			}
			return { top: _y, left: _x };
		}


		function getClickPosition(e) {
			var parentPosition = getPosition(e.currentTarget);
			var xPosition = e.clientX - parentPosition.x;
			var yPosition = e.clientY - parentPosition.y;

			return { x: xPosition, y: yPosition, clientX: e.clientX, clientY: e.clientY};
		}

		function getPosition(element) {
			var xPosition = 0;
			var yPosition = 0;

			while (element) {
				xPosition += (element.offsetLeft - element.scrollLeft + element.clientLeft);
				yPosition += (element.offsetTop - element.scrollTop + element.clientTop);
				element = element.offsetParent;
			}

			return { x: xPosition, y: yPosition };
		}

		// Area resize handles
		var bottom = document.querySelector('.bottom');
		var top = document.querySelector('.top');
		var activeListWrapper = document.querySelector('.active-list-wrapper');
		var galleryWrapper = document.querySelector('.gallery-wrapper');

		var mouseDown = false;
		var draggingBottom = false;
		var draggingGallery = false;

		window.addEventListener('mousedown', function(e) {

			mouseDown = true;
			if(e.currentTarget !== bottom || e.currentTarget !== activeListWrapper) {
				setTimeout(function() {
					mouseDown = false;
				}, 300);
			}

		});

		window.addEventListener('mouseup', function() {

			mouseDown = false;
			draggingBottom = false;
			draggingGallery = false;
			document.body.classList.remove('ns-resize');
			document.body.classList.remove('ew-resize');

		});

		window.addEventListener('mousemove', function(e) {

			var bottomPos = getAbsoluteOffsetFromBody(bottom);
			var galleryPos = getAbsoluteOffsetFromBody(galleryWrapper);
			var mousePosition = getClickPosition(e);
			
			if(mousePosition.clientY > bottomPos.top-3 && mousePosition.clientY < bottomPos.top+3) {

				document.body.classList.add('ns-resize');

				if(mouseDown) {
					draggingBottom = true;
				}
			} else if(
				mousePosition.clientX > galleryPos.left-3 &&
				mousePosition.clientX < galleryPos.left+3 &&
				mousePosition.clientY < bottomPos.top-3 ) {

				document.body.classList.add('ew-resize');

				if(mouseDown) {
					draggingGallery = true;
				}

			} else {

				if(!draggingBottom) {
					document.body.classList.remove('ns-resize');
				}

				if(!draggingGallery) {
					document.body.classList.remove('ew-resize');
				}
			}

			if(draggingBottom) {
				document.body.classList.add('ns-resize');
				e.preventDefault();
				e.cancelBubble=true;
				e.returnValue=false;

				var bottomHeight = 100 - ( mousePosition.clientY / window.innerHeight  ) * 100;

				if(bottomHeight < 20 || bottomHeight > 75) return false;

				bottom.style.height = bottomHeight + '%';
				top.style.height = (100 - bottomHeight) + '%';

				self.mainWindowResize();

				return false;
			}

			if(draggingGallery) {
				document.body.classList.add('ew-resize');
				e.preventDefault();
				e.cancelBubble=true;
				e.returnValue=false;

				var galleryWidth = 100 - ( mousePosition.clientX / window.innerWidth  ) * 100;

				if(galleryWidth < 20 || galleryWidth > (100 - (306/ window.innerWidth) * 100)) return false;

				galleryWrapper.style.width = galleryWidth + '%';
				activeListWrapper.style.width = (100 - galleryWidth) + '%';

				return false;
			}

		});

		galleryWrapper.style.width = (100 - (306/ window.innerWidth) * 100) + '%';
		//activeListWrapper.style.width = (100 - galleryWidth) + '%';

		// Layer menu

		var addLayerButton = document.querySelectorAll('.layer-menu .icon')[0];
		addLayerButton.addEventListener('click', function() {
			self.addLayer();			
		});

	};

})(module);