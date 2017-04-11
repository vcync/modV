const nodeMatchesHook = require('./node-matches-hook');

class ContextMenuHandler {
	constructor() {
		let hooks = [];

		this.addHook = require('./add-hook')(hooks).bind(this);
		this.getMenu = require('./get-menu')(hooks).bind(this);

		this.contextMenuEvent = null;
		this.contextMenuTarget = null;

		function matchesAnyHook(node) {
			for(let i=0; i < hooks.length; i++) {
				let hook = hooks[i];

				if(nodeMatchesHook(node, hook)) {
					return hook;
				}
			}

			return false;
		}

		function matchingHooks(node) {
			let matchedHooks = [];
			for(let i=0; i < hooks.length; i++) {
				let hook = hooks[i];

				if(nodeMatchesHook(node, hook)) {
					matchedHooks.push(hook);
				}
			}
			if(matchingHooks.length > 0) return matchedHooks;
			else return undefined;

		}

		document.addEventListener('contextmenu', (e) => {
			this.contextMenuEvent = e;
			this.contextMenuTarget = e.target;

			let matchedHooks = matchingHooks(e.target);

			if(matchedHooks) {
				e.preventDefault();

				matchedHooks.forEach(hook => {
					if('beforeShow' in hook) hook.beforeShow();
				});

				this.getMenu(matchedHooks[0])
					.popup(e.clientX, e.clientY);
				return false;
			}
		});
	}
}

module.exports = ContextMenuHandler;