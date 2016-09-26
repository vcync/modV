(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.setModOrder = function(modName, order) {
		var self = this;

		if(order < 0) {
			let index = -1;
			this.modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) this.modOrder.splice(index, 1);
			return false;
		}

		if(this.modOrder[order] === 'undefined') this.modOrder[order] = modName;
		else {
			let index = -1;
			this.modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) this.modOrder.splice(index, 1);
			this.modOrder.splice(order, 0, modName);
			
			this.modOrder.forEach(function(mod, idx) {
				self.activeModules[mod].info.order = idx;
			});
		}
		
		return order;
	};

})();