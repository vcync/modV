module.exports = function(modV) {
  /** @param {MeydaFeature} feature */
	modV.prototype.addMeydaFeature = function(feature) {
    const isFeatureAlreadyAdded = this.meydaFeatures.includes(feature);
    if (isFeatureAlreadyAdded) {
      return false;
    }

    this.meydaFeatures.push(feature);
		return true;
	};
};