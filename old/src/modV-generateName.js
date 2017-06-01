module.exports = function(modV) {

	modV.prototype.generateName = function(name) {
		let dupeNo = 1;

		if(name in this.activeModules) {
			let dupeName = name + ' (' + dupeNo + ')';
			while(dupeName in this.activeModules) {
				dupeNo++;
				dupeName = name + ' (' + dupeNo + ')';
			}
			return dupeName;
		} else {
			return name;
		}
	};
};