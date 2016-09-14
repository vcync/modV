modV.prototype.detectInstancesOf = function(name) {
	var self = this;

	let instances = [];
  
	forIn(self.activeModules, key => {
  		let item = self.activeModules[key];
   		if(name === item.info.originalModuleName) {
   			instances.push(item);
   		}
  	});

	return instances;
};