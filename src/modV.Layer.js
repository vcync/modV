/* globals replaceAll, Sortable, swapElements */

modV.prototype.Layer = class Layer {

	constructor(name, canvas, context, clearing, modV) {
		this.canvas = canvas || document.createElement('canvas');
		this.context = context || this.canvas.getContext('2d');
		this.clearing = clearing || false;
		this.alpha = 1;
		this.enabled = true;
		this.inherit = true;
		this.pipeline = false;
		this.blending = 'normal';
		this.name = name || 'New Layer';
		this.modules = {};
		this.moduleOrder = [];
		this.modV = modV;

		this.canvas.width = modV.outputCanvas.width;
		this.canvas.height = modV.outputCanvas.height;

		this.makeNode();
		this.makeSortable(this.node);
	}

	addModule(Module, order) {
		let modV = this.modV;
		let name = Module.info.name;
		this.modules[Module.info.name] = Module;

		if(order !== "undefined") {
			this.setOrder(Module, order, true);
		} else {
			order = this.moduleOrder.push(name)-1;
		}

		// Send to remote
		modV.remote.update('addModule', {
			name: name,
			layer: Module.getLayer(),
			order: order
		});
		
		return order;
	}

	removeModule(Module, sentToRemote) {
		let name = Module.info.name;

		// Remove from order array
		let index = this.moduleOrder.indexOf(name);
		if(index > -1) this.moduleOrder.splice(index, 1);
		else new STError('Module was not found in Layer module array');

		// Send to remote
		if(!sentToRemote) {
			modV.remote.update('removeModule', {
				name: name,
				layerIndex: Module.getLayer()
			});
		}

		// Remove from module store
		delete this.modules[name];
	}

	updateIndex(index) {
		forIn(this.modules, (key, Module) => {
			Module.setLayer(index);
		});
	}

	setOrder(Module, order, sentToRemote) {
		let name = Module.info.name;

		if(this.moduleOrder[order] === 'undefined') this.moduleOrder[order] = name;
		else {
			let index = -1;
			this.moduleOrder.forEach((mod, idx) => {
				if(name === mod) index = idx;
			});


			if(index > -1) this.moduleOrder.splice(index, 1);

			this.moduleOrder.splice(order, 0, name);
			
			this.moduleOrder.forEach((mod, idx) => {
				this.modules[mod].info.order = idx;
			});
		}

		// Send to remote
		if(!sentToRemote) {
			modV.remote.update('moduleOrder', {
				name: name,
				layer: Module.getLayer(),
				order: order
			});
		}
	}

	reverse() {
		this.moduleOrder.reverse();
		return this.moduleOrder;
	}

	toggle() {
		this.enabled = !this.enabled;
		return this.enabled;
	}

	makeNode() {
		let self = this;
		let modV = this.modV;

			// Create active list item
		let template = modV.templates.querySelector('#layer-item');
		let layerItem = document.importNode(template.content, true);
		
		// Init node in temp (TODO: don't do this)
		let temp = document.getElementById('temp');
		temp.innerHTML = '';
		temp.appendChild(layerItem);

		// Grab initialised node
		layerItem = temp.querySelector('.layer-item');

		let titleNode = layerItem.querySelector('.title');
		let collapseNode = layerItem.querySelector('.collapse');
		let moduleList = layerItem.querySelector('.module-list');

		layerItem.addEventListener('mousedown', e => {
			// ignore collapse button
			if(e.target.className.search('.fa-toggle-') > -1) return;

			modV.activeLayer = modV.layers.indexOf(this);
			modV.updateLayerControls();
			modV.layers.forEach(Layer => {
				Layer.getNode().classList.remove('active');
			});

			layerItem.classList.add('active');
		});

		titleNode.textContent = this.name;

		collapseNode.addEventListener('mousedown', function() {
			self.node.classList.toggle('collapsed');
		});

		let oldName;

		let stopEdit = function() {
			if(!this.classList.contains('editable')) return;
			
			let inputText = this.textContent.trim();

			this.contentEditable = false;
			this.classList.remove('editable');
			this.removeEventListener('keypress', enterPress);

			if(inputText.length === 0) {
				this.textContent = oldName;
				oldName = undefined;
				return;
			} else {
				self.name = inputText;
			}
			
		};

		let enterPress = function(e) {
			if(e.keyCode === 13) {
				stopEdit.bind(this)();
				return false;
			}
		};

		titleNode.addEventListener('dblclick', function() {
			if(this.classList.contains('editable')) return;

			oldName = self.name;
			this.contentEditable = true;
			this.focus();
			this.classList.add('editable');

			this.addEventListener('keypress', enterPress);
		});

		titleNode.addEventListener('blur', stopEdit);

		this.node = layerItem;
		this.moduleListNode = moduleList;

		return layerItem;
	}

	getNode() {
		return this.node;
	}

	makeSortable() {
		let gallery = document.getElementsByClassName('gallery')[0];
		let modV = this.modV;

		Sortable.create(this.moduleListNode, {
			group: {
				name: 'modV',
				pull: true,
				put: true
			},
			handle: '.handle',
			chosenClass: 'chosen',
			onAdd: evt => {
				// Dragged HTMLElement
				let itemEl = evt.item;

				if(itemEl.classList.contains('gallery-item')) {
					// Cloned element
					let clone = gallery.querySelector('.gallery-item[data-module-name="' + itemEl.dataset.moduleName + '"]');

					// Get Module
					let oldModule = modV.registeredMods[replaceAll(itemEl.dataset.moduleName, '-', ' ')];

					let Module = modV.createModule(oldModule);

					if(evt.originalEvent.shiftKey) {
						Module.info.solo = true;
					}

					// Move back to gallery
					swapElements(clone, itemEl);

					let activeItemElements = modV.createActiveListItem(Module, function(node) {
						modV.currentActiveDrag = node;
					}, function() {
						modV.currentActiveDrag  = null;
					});

					let activeItemNode = activeItemElements.node;

					Module.info.internalControls = {};
					Module.info.internalControls.alpha = activeItemElements.controls.alpha;
					Module.info.internalControls.disabled = activeItemElements.controls.disabled;
					Module.info.internalControls.blend = activeItemElements.controls.blend;

					// Replace clone
					try {
						this.moduleListNode.replaceChild(activeItemNode, clone);
					} catch(e) {
						// fail gracefully, remove clone in gallery
						let clone = evt.clone;
						clone.parentNode.removeChild(clone);

						return;
					}

					// Add to active registry
					modV.activeModules[Module.info.name] = Module;

					// Set Module's layer
					Module.setLayer(modV.layers.indexOf(this));

					// Add to layer
					this.addModule(Module, evt.newIndex);

					// Create controls
					modV.createControls(Module);

					activeItemNode.focus();
				} else if(itemEl.classList.contains('active-item')) {
					let name = replaceAll(itemEl.dataset.moduleName, '-', ' ');
					let Module = modV.activeModules[name];

					let oldIndex = Module.getLayer();
					let newIndex = modV.layers.indexOf(this);

					let Layer = modV.layers[oldIndex];

					// Layer = old layer
					// this.Layer = new layer
					
					this.modules[name] = Layer.modules[name];

					Module.setLayer(modV.layers.indexOf(this));

					this.setOrder(Module, evt.newIndex, true);

					Layer.removeModule(Module, true);

					modV.remote.update('moduleLayerMove', {
						oldLayerIndex: oldIndex,
						newLayerIndex: newIndex,
						order: evt.newIdex
					});
				}
			},
			onEnd: evt => {
				if(!evt.item.classList.contains('deletable')) {
					let name = replaceAll(evt.item.dataset.moduleName, '-', ' ');
					let Module = modV.activeModules[name];

					//modV.setModOrder(name, evt.newIndex);
					if(evt.item.parentNode.parentNode === this.node) {
						this.setOrder(Module, evt.newIndex);
					}
				}
			}
		});
	}

};