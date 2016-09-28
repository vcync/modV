modV.prototype.deleteActiveModule = function(Module) {
	let safeName = Module.info.safeName;

	let list = document.getElementsByClassName('active-list')[0];
	let activeItemNode = list.querySelector('.active-item[data-module-name="' + safeName + '"]');
	let panel = document.querySelector('.control-panel[data-module-name="' + safeName + '"]');

	this.currentActiveDrag = null;

	forIn(this.activeModules, (moduleName, Module) => {
		if(Module.info.safeName === safeName) {
			
			Module.info.controls.forEach(control => {
				
				// remove palette from global palette store
				if(control instanceof this.PaletteControl) {
					this.palettes.splice(control.paletteIndex, 1);
				}
			});

			console.info('Deleting', moduleName);
			delete this.activeModules[moduleName];
			
			list.removeChild(activeItemNode);
			panel.parentNode.removeChild(panel);
			this.setModOrder(moduleName, -1);
		}
	});

};