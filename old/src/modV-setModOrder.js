module.exports = function(modV) {

	modV.prototype.setModOrder = function(modName, order) {
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

			this.modOrder.forEach((mod, idx) => {
				this.activeModules[mod].info.order = idx;
			});
		}

		return order;
	};
};