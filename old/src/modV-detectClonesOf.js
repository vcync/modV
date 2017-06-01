const {forIn} = require('./utils');


module.exports = function(modV) {

	modV.prototype.detectClonesOf = function(name) {

		let clones = [];

		forIn(this.activeModules, key => {
			let item = this.activeModules[key];
			if(name === item.info.originalModuleName && item.info.name !== item.info.originalModuleName) clones.push(item);
		});

		return clones;
	};
};