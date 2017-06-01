module.exports = function(modV) {
	modV.prototype.setName = function(name) {
		this.options.user = name;
		this.mediaManager.saveOption('user', name);
		this.saveOptions();
	};
};