modV.prototype.deleteActiveModule = function(Module) {
	var self = this;
	var safeName = Module.info.safeName;

	var list = document.getElementsByClassName('active-list')[0];
	var activeItemNode = list.querySelector('.active-item[data-module-name="' + safeName + '"]');
	var panel = document.querySelector('.control-panel[data-module-name="' + safeName + '"]');

	self.currentActiveDrag  = null;

	forIn(self.activeModules, (moduleName, Module) => {
		if(Module.info.safeName === safeName) {
			
			console.info('Deleting', moduleName);
			delete self.activeModules[moduleName];
			
			list.removeChild(activeItemNode);
			panel.parentNode.removeChild(panel);
			self.setModOrder(moduleName, -1);
		}
	});

};