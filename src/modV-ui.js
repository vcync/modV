(function(bModule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.startUI = function() {
		var self = this;

		var gallery = document.getElementsByClassName('gallery')[0];
		var list = document.getElementsByClassName('active-list')[0];
		Sortable.create(list, {
			group: {
				name: 'modV',
				pull: true,
				put: true
			},
			handle: '.handle',
			chosenClass: 'chosen',
			onAdd: function(evt) {
				// Dragged HTMLElement
				var itemEl = evt.item;
				// Cloned element
				var clone = gallery.querySelector('.gallery-item[data-module-name="' + itemEl.dataset.moduleName + '"]');

				var activeItemObject = self.createActiveListItem(itemEl, clone);
				var activeItem = activeItemObject.node;

				// Replace clone
				list.replaceChild(activeItem, clone);

				// Get Module
				var Module = self.registeredMods[itemEl.dataset.moduleName.replace('-', ' ')];

				if(activeItemObject.dupe > 0) {
					// Clone module -- afaik, there is no better way than this
					Module = self.cloneModule(Module, true);
					
					// init cloned Module
					if('init' in Module) {
						Module.init(self.canvas, self.context);
					}
					
					// update name, add to registry
					Module.info.name = activeItemObject.name;
					self.registeredMods[Module.info.name] = Module;

					// TEST
					// TODO: remove setModOrder and modOrder
					self.setModOrder(activeItemObject.name, Object.size(self.registeredMods));

					// turn on
					Module.info.disabled = false;
				} else {
					Module.info.disabled = false;
				}
				activeItem.focus();
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

		window.addEventListener('focusin', activeElementHandler);
		window.addEventListener('focusout', clearActiveElement);

		function activeElementHandler(evt) {
			console.log(evt.srcElement.closest('.active-item'));
		}

		function clearActiveElement() {
			console.log('clear')
		}

	};

})(module);