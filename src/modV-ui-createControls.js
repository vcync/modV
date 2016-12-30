(function() {
	'use strict';
	/*jslint browser: true */

	modV.prototype.createControls = function(Module, isPreset) {
		var self = this;
		var controlPanelWrapperNode = document.querySelector('.control-panel-wrapper');
		var panelNode = document.createElement('div');
		var titleNode = document.createElement('h1');

		titleNode.textContent = Module.info.name;

		panelNode.appendChild(titleNode);

		panelNode.classList.add('control-panel', 'pure-u-1-1');
		panelNode.dataset.moduleName = Module.info.safeName;

		if('controls' in Module.info) { 

			forIn(Module.info.controls, (key, Control) => {

				if(!Control.makeNode) return;
				var inputNode;

				inputNode = Control.makeNode(Module, self, isPreset);

				inputNode.addEventListener('contextmenu', function(ev) {
					ev.preventDefault();
					
					self.showContextMenu('control', [Control, Module, inputNode], ev);

					return false;
				}, false);

				var groupNode = document.createElement('div');
				groupNode.classList.add('control-group');
				var labelNode = document.createElement('label');
				labelNode.textContent = Control.label;
				groupNode.appendChild(labelNode);
				groupNode.appendChild(inputNode);
				panelNode.appendChild(groupNode);
			});

		}

		controlPanelWrapperNode.appendChild(panelNode);

	};

})();