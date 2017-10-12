module.exports = function(modV) {
	modV.prototype.CustomControl = class CustomControl {

		constructor(settings) {
			this._customNode = settings;
			this._node = null;

			let id;

			Object.defineProperty(this, 'id', {
				set: (idIn) => {
					id = idIn;
				},
				get: () => {
					return id;
				}
			});

			Object.defineProperty(this, 'settings', {
				get: () => {
					return {
						useInternalValue: false
					};
				}
			});
		}

		init(id, Module, node, isPreset, internalPresetValue) {
			let settings = this.settings;
			this.id = id;
			this._node = node;
			node.id = id;

			// Control being used internally, return
			if(settings.useInternalValue) {
				if(isPreset) node.value = internalPresetValue;
				else if('default' in settings) node.value = settings.default;

				return;
			}

			this._Module = Module;

			let nodeValue;

			if('default' in settings) {
				if(!isPreset) this.value = settings.default;
				nodeValue = settings.default;

			} else if(Module[this.variable] !== undefined) {
				nodeValue = Module[this.variable];
			}

			if(isPreset) {
				nodeValue = Module[this.variable];
			}

			if('append' in settings && typeof nodeValue === 'string') {
				node.value = nodeValue.replace(settings.append, '');
			}

			if('prepend' in settings && typeof nodeValue === 'string') {
				node.value = nodeValue.replace(settings.prepend, '');
			}
			node.value = nodeValue;
		}

		get label() {
			return this.settings.label;
		}

		get variable() {
			return this.settings.variable;
		}

		makeNode(modV, ModuleRef, isPreset, internalPresetValue) {
			let id;
			let Module;
			let variable = this.variable;
			let settings = this.settings;

			if(!settings.useInternalValue) {
				Module = ModuleRef;
				id = Module.info.safeName + '-' + variable;
			}

			let node = this._customNode(Module);

			this.init(id, ModuleRef, node, isPreset, internalPresetValue);
			return node;
		}
	};
};