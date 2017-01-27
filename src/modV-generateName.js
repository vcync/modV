module.exports = function(modV) {

	modV.prototype.generateName = function(name) {
		var self = this;
		var dupeNo = 1;

		if(name in self.activeModules) {
			var dupeName = name + ' (' + dupeNo + ')';
			while(dupeName in self.activeModules) {
				dupeNo++;
				dupeName = name + ' (' + dupeNo + ')';
			}
			return dupeName;
		} else {
			return name;
		}
	};
};