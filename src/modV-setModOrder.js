(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.setModOrder = function(modName, order) {
		//var self = this;

		if(order < 0) {
			console.log('attempting splice', this.modOrder);
			var index = -1;
			this.modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) this.modOrder.splice(index, 1);
			console.log('index is:', index, this.modOrder);
			return false;
		}

		if(this.modOrder[order] === 'undefined') this.modOrder[order] = modName;
		else {
			var index = -1; // jshint ignore:line
			this.modOrder.forEach(function(mod, idx) {
				if(modName === mod) index = idx;
			});
			if(index > -1) this.modOrder.splice(index, 1);
			this.modOrder.splice(order, 0, modName);
			
			/*this.modOrder.forEach(function(mod, idx) {
				self.registeredMods[mod].info.order = idx;
			});*/
		}
		
		return order;
	};

})();