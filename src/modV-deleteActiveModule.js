module.exports = function(modV) {

	modV.prototype.deleteActiveModule = function(Module) {
		let safeName = Module.info.safeName;

		let list = document.getElementsByClassName('active-list')[0];
		let activeItemNode = list.querySelector('.active-item[data-module-name="' + safeName + '"]');
		let panel = document.querySelector('.control-panel[data-module-name="' + safeName + '"]');

		this.currentActiveDrag = null;

		forIn(this.activeModules, (moduleName, Module) => {
			if(Module.info.safeName === safeName) {
				
				forIn(Module.info.controls, (key, Control) => {

					// remove palette from global palette store
					if(Control instanceof this.PaletteControl) {
						this.palettes.forEach((Palette, idx) => {
							if(Control.id === Palette.id) {
								this.palettes.splice(idx, 1);
								return;
							}
						});
					}
				});


				this.MIDIInstance.assignments.forEach(MIDIDevice => {
					let toRemove = [];
					forIn(MIDIDevice, (MIDIChannel, assignment) => {
						if(assignment.moduleName === Module.info.name) toRemove.push(MIDIChannel);
					});
					
					toRemove.forEach(key => {
						delete MIDIDevice[key];
					});
				});

				let Layer = this.layers[Module.getLayer()];

				Layer.removeModule(Module);

				console.info('Deleting', moduleName);
				delete this.activeModules[moduleName];
				
				activeItemNode.parentNode.removeChild(activeItemNode);
				panel.parentNode.removeChild(panel);
				this.setModOrder(moduleName, -1);
			}
		});

	};
};