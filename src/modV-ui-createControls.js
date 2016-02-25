(function(bModule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.createControls = function(Module, modVSelf) {
		var self = this;
		var controlPanelWrapperNode = document.querySelector('.control-panel-wrapper');
		var panelNode = document.createElement('div');
		var titleNode = document.createElement('h1');

		titleNode.textContent = Module.info.name;

		panelNode.appendChild(titleNode);

		panelNode.classList.add('control-panel', 'pure-u-1-1');
		panelNode.dataset.moduleName = Module.info.safeName;

		if('controls' in Module.info) { 

			Module.info.controls.forEach(function(control, idx) {
				if(!control.makeNode) return;
				var inputNode;

				console.log('createControls', control.variable);

				inputNode = control.makeNode(Module, modVSelf);

				var groupNode = document.createElement('div');
				groupNode.classList.add('control-group');
				var labelNode = document.createElement('label');
				labelNode.textContent = control.label;
				groupNode.appendChild(labelNode);
				groupNode.appendChild(inputNode);
				panelNode.appendChild(groupNode);
			});

		}

		controlPanelWrapperNode.appendChild(panelNode);

	};

})(module);