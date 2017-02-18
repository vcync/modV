module.exports = function(modV) {
	modV.prototype.addMeydaFeature = function(feature) {
		if(!Array.contains(feature, this.meydaFeatures)) {
			this.meydaFeatures.push(feature);
			return true;
		} else return false;
	};
};