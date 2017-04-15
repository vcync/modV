/* globals Sortable */

const EventEmitter2 = require('eventemitter2').EventEmitter2;
const swapElements = require('./fragments/swap-elements');
const replaceAll = require('./fragments/replace-all');

module.exports = function(modV) {

	/**
	 * Layer
	 * @extends EventEmitter2
	 */
	class Layer extends EventEmitter2 {

		constructor(nameIn, canvas, context, clearingIn, modV) {
			super();

			/**
			 * The Layer's Canvas
			 * @type {HTMLCanvas}
			 */
			this.canvas = canvas || document.createElement('canvas');

			/**
			 * The Context for the Layer's Canvas
			 * @type {CanvasRenderingContext2D}
			 */
			this.context = context || this.canvas.getContext('2d');

			/**
			 * Name of the Layer
			 * @type {String}
			 */
			this.name = nameIn || 'New Layer';

			/**
			 * Modules contained within the Layer
			 * @type {Object}
			 */
			this.modules = {};

			/**
			 * The draw order of the Modules contained within the Layer
			 * @type {Array}
			 */
			this.moduleOrder = [];

			/**
			 * Reference to a modV instance (for convinience)
			 * @type {ModV}
			 */
			this.modV = modV;

			let clearing = clearingIn || false,
				alpha = 1,
				enabled = true,
				inherit = true,
				inheritFrom = -1, // -1 = canvas before, any other number corresponds to modV.layers index
				pipeline = false,
				drawToOutput = true,
				locked = false,
				blending = 'normal';

			/**
			 * Indicates whether the Layer should clear before redraw
			 * @type {Boolean}
			 * @name Layer#clearing
			 */
			Object.defineProperty(this, 'clearing', {
				get: () => {
					return clearing;
				},
				set: (clearingIn) => {
					clearing = clearingIn;

					/**
					 * {@link Layer#clearing} state change event
					 * @event Layer#clearingSet
					 * @type {Boolean}
					 */
					this.emit('clearingSet',
						clearing
					);
				}
			});

			/**
			 * The level of opacity between 0 and 1 the Layer should be muxed at
			 * @type {Number}
			 * @name Layer#alpha
			 */
			Object.defineProperty(this, 'alpha', {
				get: () => {
					return alpha;
				},
				set: (alphaIn) => {
					alpha = alphaIn;

					/**
					 * {@link Layer#alpha} state change event
					 * @event Layer#alphaSet
					 * @type {Number}
					 */
					this.emit('alphaSet',
						alpha
					);
				}
			});

			/**
			 * Indicates whether the Layer should be drawn
			 * @type {Boolean}
			 * @name Layer#enabled
			 */
			Object.defineProperty(this, 'enabled', {
				get: () => {
					return enabled;
				},
				set: (enabledIn) => {
					enabled = enabledIn;

					/**
					 * {@link Layer#enabled} state change event
					 * @event Layer#enabledSet
					 * @type {Boolean}
					 */
					this.emit('enabledSet',
						enabled
					);
				}
			});

			/**
			 * Indicates whether the Layer should inherit from another Layer at redraw
			 * @type {Boolean}
			 * @name Layer#inherit
			 */
			Object.defineProperty(this, 'inherit', {
				get: () => {
					return inherit;
				},
				set: (inheritIn) => {
					inherit = inheritIn;

					/**
					 * {@link Layer#inherit} state change event
					 * @event Layer#inheritSet
					 * @type {Boolean}
					 */
					this.emit('inheritSet',
						inherit
					);
				}
			});

			/**
			 * The target Layer to inherit from, -1 being the previous Layer in modV#layers, 0-n being the index of another Layer within modV#layers
			 * @type {Number}
			 * @name Layer#inheritFrom
			 */
			Object.defineProperty(this, 'inheritFrom', {
				get: () => {
					return inheritFrom;
				},
				set: (inheritFromIn) => {
					inheritFrom = inheritFromIn;

					/**
					 * {@link Layer#inheritFrom} state change event
					 * @event Layer#inheritFromSet
					 * @type {Number}
					 */
					this.emit('inheritFromSet',
						inheritFrom
					);
				}
			});

			/**
			 * Indicates whether the Layer should render using pipeline at redraw
			 * @type {Boolean}
			 * @name Layer#pipeline
			 */
			Object.defineProperty(this, 'pipeline', {
				get: () => {
					return pipeline;
				},
				set: (pipelineIn) => {
					pipeline = pipelineIn;

					/**
					 * {@link Layer#pipeline} state change event
					 * @event Layer#pipelineSet
					 * @type {Boolean}
					 */
					this.emit('pipelineSet',
						pipeline
					);
				}
			});

			/**
			 * Indicates whether the Layer should mux to the output canvas on the output window
			 * @type {Boolean}
			 * @name Layer#drawToOutput
			 */
			Object.defineProperty(this, 'drawToOutput', {
				get: () => {
					return drawToOutput;
				},
				set: (drawToOutputIn) => {
					drawToOutput = drawToOutputIn;

					/**
					 * {@link Layer#drawToOutput} state change event
					 * @event Layer#drawToOutputSet
					 * @type {Boolean}
					 */
					this.emit('drawToOutputSet',
						drawToOutput
					);
				}
			});

			/**
			 * Indicates whether the Layer is Locked
			 * @type {Boolean}
			 * @name Layer#locked
			 */
			Object.defineProperty(this, 'locked', {
				get: () => {
					return locked;
				},
				set: (lockedIn) => {
					locked = lockedIn;

					/**
					 * {@link Layer#locked} state change event
					 * @event Layer#lockedSet
					 * @type {Boolean}
					 */
					this.emit('lockedSet',
						locked
					);
				}
			});

			/**
			 * The {@link Blendmode} the Layer muxes with
			 * @type {String}
			 * @name Layer#blending
			 */
			Object.defineProperty(this, 'blending', {
				get: () => {
					return blending;
				},
				set: (blendingIn) => {
					blending = blendingIn;

					/**
					 * {@link Layer#blending} state change event
					 * @event Layer#blendingSet
					 * @type {String}
					 */
					this.emit('blendingSet',
						blending
					);
				}
			});

			this.canvas.width = modV.outputCanvas.width;
			this.canvas.height = modV.outputCanvas.height;

			this.nodes = {};

			this.makeNode();
			this.makeSortable(this.node);
		}

		/**
		 * Add a Module to the Layer
		 * @param {Module} Module
		 * @param {Number} order  The position within {@link Layer#moduleOrder} the Module should be inserted at
		 * @return {Number}       The position within {@link Layer#moduleOrder} the Module was inserted at
		 */
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

			this.emit('moduleAdd',
				Module,
				order
			);

			return order;
		}

		/**
		 * Remove a Module from the Layer
		 * @param  {Module}  Module       [description]
		 * @param  {Boolean} sentToRemote [description]
		 */
		removeModule(Module, sentToRemote) {
			let name = Module.info.name;

			// Remove from order array
			let index = this.moduleOrder.indexOf(name);
			if(index > -1) this.moduleOrder.splice(index, 1);
			else new STError('Module was not found in Layer module array');

			// Send to remote
			if(!sentToRemote) {
				this.modV.remote.update('removeModule', {
					name: name,
					layerIndex: Module.getLayer()
				});
			}

			this.emit('moduleRemove',
				Module,
				index
			);

			// Remove from module store
			delete this.modules[name];
		}

		/**
		 * Update the Layer's index. Will also call {@link Module#setLayer} of all the Modules contained within the Layer
		 * @param  {Number} index
		 */
		updateIndex(index) {
			forIn(this.modules, (key, Module) => {
				Module.setLayer(index);
			});
		}

		/**
		 * [setOrder description]
		 * @param {Module}  Module        [description]
		 * @param {Number}  order         [description]
		 * @param {Boolean} sentToRemote  [description]
		 * @param {Boolean}  moveNodes    [description]
		 */
		setOrder(Module, order, sentToRemote, moveNodes) {
			let name = Module.info.name;

			if(this.moduleOrder[order] === 'undefined') this.moduleOrder[order] = name;
			else {
				let index = -1;
				this.moduleOrder.forEach((mod, idx) => {
					if(name === mod) index = idx;
				});


				if(index > -1) this.moduleOrder.splice(index, 1);

				this.moduleOrder.splice(order, 0, name);

				if(moveNodes) {
					let children = this.node.querySelector('.module-list').children;
					children[index].parentNode.insertBefore(children[index], children[order]);
				}

				this.moduleOrder.forEach((mod, idx) => {
					this.modules[mod].info.order = idx;
				});
			}

			// Send to remote
			if(!sentToRemote) {
				this.modV.remote.update('moduleOrder', {
					name: name,
					layer: Module.getLayer(),
					order: order
				});

				this.emit('moduleReorder',
					Module,
					order
				);
			}
		}

		/**
		 * Reverse the order of the contained Modules
		 * @param  {Boolean} moveNodes Move the Element nodes of the Layer Items shown in the active list
		 * @return {Array}             The new order of Modules within the Layer
		 */
		reverse(moveNodes) {
			//this.moduleOrder.reverse();
			for(let i=0; i < this.moduleOrder.length; i++) {
				let Module = this.modules[this.moduleOrder[i]];

				this.setOrder(Module, this.moduleOrder.length-i, true, moveNodes);
			}

			return this.moduleOrder;
		}

		/**
		 * Toggle the Layer, enabled or disabled
		 * @return {Boolean} The value of {@link Layer#enabled}
		 */
		toggle() {
			this.enabled = !this.enabled;

			this.emit('enabled',
				this.enabled
			);

			return this.enabled;
		}

		/**
		 * Make the Layer's Element node
		 * @return {Element} The build node
		 */
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
			let lockNode = layerItem.querySelector('.lock');
			let moduleList = layerItem.querySelector('.module-list');

			layerItem.addEventListener('mousedown', e => {
				// ignore collapse button
				if(
					e.target.className.search('.fa-toggle-') > -1 ||
					e.target.className.search('.fa-lock') > -1 ||
					e.target.className.search('.fa-unlock-') > -1
				) return;

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

			lockNode.addEventListener('mousedown', function() {
				self.node.classList.toggle('locked');
				self.locked = !self.locked;
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
					self.setName(inputText);
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

			this.nodes.layer = layerItem;
			this.nodes.moduleList = moduleList;
			this.nodes.title = titleNode;

			this.node = layerItem;
			this.moduleListNode = moduleList;

			return layerItem;
		}

		/**
		 * The Layer's Element node, presumably build with {@link Layer#makeNode}
		 * @return {Element}
		 */
		getNode() {
			return this.node;
		}

		/**
		 * Set the Layer's name
		 * @param {String} name
		 */
		setName(name) {
			name = name.trim();
			if(name.length === 0) return;

			this.name = name;
			this.nodes.title.textContent = name;

			this.modV.updateLayerSelectors();

			this.emit('nameChange',
				name
			);

			return true;
		}

		/**
		 * [makeSortable description]
		 */
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

						let Module = modV.createModule(oldModule, this.canvas, this.context);

						// If shift is held when dropped, disable Module's output
						if(evt.originalEvent.shiftKey) {
							Module.info.disabled = true;
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

	}

	/**
	 * @name Layer
	 * @memberOf modV
	 * @type {Layer}
	 */
	modV.prototype.Layer = Layer;
};