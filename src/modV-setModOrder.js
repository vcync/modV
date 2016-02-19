(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.setModOrder = function(modName, order) {
		var self = this;

		if(this.modOrder[order] === 'undefined') this.modOrder[order] = modName;
		else {
			var index = -1;
			this.modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) this.modOrder.splice(index, 1);
			this.modOrder.splice(order, 0, modName);
			
			this.modOrder.forEach(function(mod, idx) {
				self.registeredMods[mod].info.order = idx;
			});
		}
		/*
		// Reorder DOM elements (ugh ;_;)
		var list = this.controllerWindow.document.body;
		var items = list.querySelectorAll('fieldset[data-name]');
		var itemsArr = [];
		for (var i in items) {
			if(items[i].nodeType === 1) { // Remove the whitespace text nodes
				itemsArr.push(items[i]);
			}
		}
		
		itemsArr.sort(function(a, b) {
			var aOrder = this.registeredMods[a.dataset.name].info.order;
			var bOrder = this.registeredMods[b.dataset.name].info.order;
			
			return aOrder-bOrder;
		});
		
		for(i = 0; i < itemsArr.length; ++i) {
			list.appendChild(itemsArr[i]);
		}*/
		
		return order;
	};

})(module);