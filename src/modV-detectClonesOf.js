modV.prototype.detectClonesOf = function(name) {
	var self = this;

	let clones = [];
  
	forIn(self.activeModules, key => {
  		let item = self.activeModules[key];
   		if(name === item.info.originalModuleName && item.info.name !== item.info.originalModuleName) clones.push(item);
  	});

	return clones;
};