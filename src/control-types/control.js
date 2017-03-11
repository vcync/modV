module.exports = class Control {

	constructor(settings) {
		if(!('variable' in settings)) throw new Error('Control had no "variable" in settings');
		if(!('label' in settings) && !settings.useInternalValue) {
			throw new Error('Control had no "label" in settings');
		}

		this._node = null;

		let id, value;

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
				return settings;
			}
		});

		Object.defineProperty(this, 'value', {
			get: () => {
				return value;
			},
			set: (valueIn) => {
				let variable = settings.variable;

				if(settings.varType === 'int') value = parseInt(valueIn);
				else if(settings.varType === 'float') value = parseFloat(valueIn);
				else value = valueIn;

				if('prepend' in settings) value = settings.prepend + value;
				if('append' in settings) value += settings.append;

				if(!settings.useInternalValue) this._Module[variable] = value;
				else settings.oninput(value);
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
};