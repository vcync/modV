module.exports = function(hooks) {
	return function addHook(hook) {
		if(!hook) return false;

		if(
			!('nodeType' in hook) &&
			!('className' in hook) &&
			!('nodeAttributes' in hook)
		) throw 'Must have at least one of nodeType, className or nodeAttributes in Object';

		if('nodeType' in hook) {
			if(typeof hook.nodeType !== 'string' && !Array.isArray(hook.nodeType)) {
				throw 'nodeType must be either Array or String';
			}
		}

		if('className' in hook) {
			if(typeof hook.className !== 'string' && !Array.isArray(hook.className)) {
				throw 'className must be either Array or String';
			}
		}

		if('nodeAttributes' in hook) {
			if(typeof hook.nodeAttributes !== 'object') {
				throw 'nodeAttributes must be type Object';
			}
		}

		if(!('menuItems' in hook)) throw 'Must have menuItems in Object';

		if(!Array.isArray(hook.menuItems)) {
			throw 'menuItems must be an instance of Array';
		}

		if(!('matchAnyClass' in hook)) {
			hook.matchAnyClass = true;
		} else {
			if(typeof hook.matchAnyClass !== 'boolean') throw 'matchAnyClass must be type Boolean';
		}

		if('beforeShow' in hook) {
			if(typeof hook.beforeShow !== 'function') throw 'beforeShow must be type Function';
		}

		hooks.push(hook);
		return true;
	};
};