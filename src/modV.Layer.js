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
		let name = Module.info.name;
		this.modules[Module.info.name] = Module;

		if(order !== "undefined") {
			this.setOrder(Module, order);
		} else {
			order = this.moduleOrder.push(name)-1;
		}
		
		return order;
	}

	removeModule(Module) {
		let name = Module.info.name;

		// Remove from order array
		let index = this.moduleOrder.indexOf(name);
		if(index > -1) this.moduleOrder.splice(index, 1);
		else new STError('Module was not found in Layer module array');

		// Remove from module store
		delete this.modules[name];
	}

	updateIndex(index) {
		forIn(this.modules, (key, Module) => {
			Module.setLayer(index);
		});
	}

	setOrder(Module, order) {
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

		titleNode.textContent = this.name;

		collapseNode.addEventListener('click', function() {
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

		console.log(layerItem.nodeType);

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

					let activeItemNode = modV.createActiveListItem(Module, function(node) {
						modV.currentActiveDrag = node;
					}, function() {
						modV.currentActiveDrag  = null;
					});

					// Replace clone
					try {
						this.moduleListNode.replaceChild(activeItemNode, clone);
					} catch(e) {
						throw new STError(e);
					}

					// Add to active registry
					modV.activeModules[Module.info.name] = Module;

					// Add to layer
					this.addModule(Module, evt.newIndex);

					// Set Module's layer
					Module.setLayer(modV.layers.indexOf(this));

					// Create controls
					modV.createControls(Module);

					activeItemNode.focus();
				} else if(itemEl.classList.contains('active-item')) {
					let name = replaceAll(itemEl.dataset.moduleName, '-', ' ');
					let Module = modV.activeModules[name];
					let Layer = modV.layers[Module.getLayer()];

					this.modules[name] = Layer.modules[name];

					this.setOrder(Module, evt.newIndex);

					Layer.removeModule(Module);

					Module.setLayer(modV.layers.indexOf(this));

					// 1. find parent layer ✔︎
					// 2. reference existing Module in new Layer's modules object ✔︎
					// 3. insert new moduleOrder index ✔︎
					// 4. delete existing Module from old Layer's modules object ✔︎
					// 5. update Module's layer ✔︎
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