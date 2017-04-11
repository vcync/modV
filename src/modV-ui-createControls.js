module.exports = function(modV) {

	modV.prototype.createControls = function(Module, isPreset) {
		let controlPanelWrapperNode = document.querySelector('.control-panel-wrapper');
		let panelNode = document.createElement('div');
		let titleNode = document.createElement('h1');

		titleNode.textContent = Module.info.name;

		panelNode.appendChild(titleNode);

		panelNode.classList.add('control-panel', 'pure-u-1-1');
		panelNode.dataset.moduleName = Module.info.safeName;

		if('controls' in Module.info) {

			forIn(Module.info.controls, (key, Control) => {

				if(!Control.makeNode) return;
				let id = Module.info.safeName + '-' + Control.variable;
				let inputNode;

				inputNode = Control.makeNode(this, Module, id, isPreset);

				// inputNode.addEventListener('contextmenu', (ev) => {
				// 	ev.preventDefault();

				// 	this.showContextMenu('control', [Control, Module, inputNode], ev);

				// 	return false;
				// }, false);

				let groupNode = document.createElement('div');
				groupNode.classList.add('control-group');

				let labelNode = document.createElement('label');
				labelNode.textContent = Control.label;

				groupNode.appendChild(labelNode);
				groupNode.appendChild(inputNode);
				panelNode.appendChild(groupNode);
			});

		}

		controlPanelWrapperNode.appendChild(panelNode);
	};
};