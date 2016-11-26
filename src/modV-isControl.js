modV.prototype.isControl = function(Control, callbacks) {
	
	if(Control instanceof this.RangeControl) {
		if('range' in callbacks) callbacks.range();
	} else

	if(Control instanceof this.CheckboxControl) {
		if('checkbox' in callbacks) callbacks.checkbox();
	} else

	if(Control instanceof this.SelectControl || Control instanceof this.CompositeOperationControl) {
		if('select' in callbacks) callbacks.select();
	} else

	if(Control instanceof this.ColorControl) {
		if('color' in callbacks) callbacks.color();
	} else

	if(Control instanceof this.TextControl) {
		if('text' in callbacks) callbacks.text();
	} else

	if(Control instanceof this.VideoControl) {
		if('video' in callbacks) callbacks.video();
	} else

	if(Control instanceof this.PaletteControl) {
		if('palette' in callbacks) callbacks.palette();
	} else

	if(Control instanceof this.ImageControl) {
		if('image' in callbacks) callbacks.image();
	}
};