(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.setModOrder = function(modName, order) {
		var self = this;

		if(modV.modOrder[order] === 'undefined') modV.modOrder[order] = modName;
		else {
			var index = -1;
			modV.modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) modV.modOrder.splice(index, 1);
			modV.modOrder.splice(order, 0, modName);
			
			modV.modOrder.forEach(function(mod, idx) {
				modV.registeredMods[mod].info.order = idx;
			});
		}
		
		// Reorder DOM elements (ugh ;_;)
		var list = modV.controllerWindow.document.body;
		var items = list.querySelectorAll('fieldset[data-name]');
		var itemsArr = [];
		for (var i in items) {
			if(items[i].nodeType === 1) { // Remove the whitespace text nodes
				itemsArr.push(items[i]);
			}
		}
		
		itemsArr.sort(function(a, b) {
			var aOrder = modV.registeredMods[a.dataset.name].info.order;
			var bOrder = modV.registeredMods[b.dataset.name].info.order;
			
			return aOrder-bOrder;
		});
		
		for(i = 0; i < itemsArr.length; ++i) {
			list.appendChild(itemsArr[i]);
		}
		
		return order;
	};

})(module);