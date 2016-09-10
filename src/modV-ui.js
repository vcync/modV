/* globals Sortable, swapElements */
(function() {
	'use strict';
	/*jslint browser: true */

	function replaceAll(string, operator, replacement) {
		return string.split(operator).join(replacement);
	}

	modV.prototype.startUI = function() {
		var self = this;

		self.mainWindowResize();

		var gallery = document.getElementsByClassName('gallery')[0];
		var list = document.getElementsByClassName('active-list')[0];
		self.currentActiveDrag = null;

		Sortable.create(list, {
			group: {
				name: 'modV',
				pull: true,
				put: true
			},
			handle: '.handle',
			chosenClass: 'chosen',
			onAdd: function(evt) {
				console.log('drop', evt);

				// Dragged HTMLElement
				var itemEl = evt.item;
				// Cloned element
				var clone = gallery.querySelector('.gallery-item[data-module-name="' + itemEl.dataset.moduleName + '"]');

				// Get Module
				var Module = self.registeredMods[replaceAll(itemEl.dataset.moduleName, '-', ' ')];

				// Grab dataname from cloned element
				var name = Module.info.name;
				var originalName = Module.info.name;
				// Create new safe name
				var safeName = replaceAll(name, ' ', '-');
				
				// Get number of same modules in active list
				var dupes = self.getNumberOfModuleDupes(name);

				if(dupes.length > 0) {
					var oldModule = Module;
					Module = new self.moduleStore[Module.info.originalModuleName]();

					/*// Create new controls from original Module to avoid scope contamination
					if('controls' in oldModule.info) {
						Module.info.controls = [];

						oldModule.info.controls.forEach(function(control) {
							var settings = control.getSettings();
							var newControl = new control.constructor(settings);
							Module.info.controls.push(newControl);
						});
					}*/

					if(Module instanceof self.ModuleShader) {
						Module.programIndex = oldModule.programIndex;
						
						// Loop through Uniforms, expose self.uniforms and create local variables
						if('uniforms' in Module.settings.info) {

							forIn(Module.settings.info.uniforms, (uniformKey, uniform) => {
								switch(uniform.type) {
									case 'f':
										Module[uniformKey] = parseFloat(uniform.value);
										break;

									case 'i':
										Module[uniformKey] = parseInt(uniform.value);
										break;

									case 'b':
										Module[uniformKey] = uniform.value;
										break;

								}
							});
						}
					}

					// init cloned Module
					if('init' in Module) {
						Module.init(self.canvas, self.context);
					}

					// new name
					name += " (" + dupes.length + ")";
					safeName = replaceAll(name, ' ', '-');
					
					// update name
					Module.info.name = name;
					Module.info.safeName = safeName;
					Module.info.originalName = originalName;
				}

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

				// Add to registry
				self.registeredMods[Module.info.name] = Module;

				self.setModOrder(name, evt.newIndex);

				// Create controls
				console.log('Creating controls for', name, Module);
				self.createControls(Module, self);

				// turn on
				// TODO: add setting to enable/disable by default
				Module.info.disabled = false;

				activeItemNode.focus();
			},
			onEnd: function(evt) {
				if(!evt.item.classList.contains('deletable')) {
					self.setModOrder(replaceAll(evt.item.dataset.moduleName, '-', ' '), evt.newIndex);
				}
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
			var activeItemNode = list.querySelector('.active-item[data-module-name="' + droppedModuleData + '"]');
			var panel = document.querySelector('.control-panel[data-module-name="' + droppedModuleData + '"]');

			console.log('gallery drop', droppedModuleData);
			self.currentActiveDrag  = null;

			forIn(self.registeredMods, (moduleName, Module) => {
				if(Module.info.safeName === droppedModuleData) {
					
					if('originalName' in Module.info) {
						var name = replaceAll(Module.info.originalName, ' ', '-');

						var dupes = list.querySelectorAll('.active-item[data-module-name|="' + name + '"]');
						if(dupes.length > 1) {
							console.log('deleting', moduleName);
							delete self.registeredMods[moduleName];
						}
					}

					list.removeChild(activeItemNode);
					panel.parentNode.removeChild(panel);
					self.setModOrder(moduleName, -1);
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

				if(galleryWidth < 20 || galleryWidth > 80) return false;

				galleryWrapper.style.width = galleryWidth + '%';
				activeListWrapper.style.width = (100 - galleryWidth) + '%';

				return false;
			}

		});

		// Module Grouping

		/*var addGroupButton = document.querySelectorAll('.module-menu .icon')[0];
		addGroupButton.addEventListener('click', function() {
			
			// Create active list item
			var template = self.templates.querySelector('#module-group');
			var group = document.importNode(template.content, true);

			// Create Group
			var Group = new self.Group();
			var groupIndex = self.groups.push(Group)-1;
			Group = self.groups[groupIndex];

			// Temp container (TODO: don't do this)
			var temp = document.getElementById('temp');

			// Init node in temp (TODO: don't do this)
			temp.innerHTML = '';
			temp.appendChild(group);
			// Grab initialised node
			group = temp.querySelector('div');

			var titleNode = group.querySelector('.title');

			titleNode.addEventListener('dblclick', function() {
				this.contentEditable = true;
				this.focus();
				this.classList.add('editable');
			});

			titleNode.addEventListener('blur', function() {
				this.contentEditable = false;
				this.classList.remove('editable');
			});

			titleNode.addEventListener('keypress', function(evt) {
				if(evt.which === 13) evt.preventDefault();
			});

			titleNode.textContent = 'New Group';
			
			list.appendChild(group);

		});*/

	};

})(module);