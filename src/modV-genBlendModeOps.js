modV.prototype.genBlendModeOps = function() {
	let selectEl = document.createElement('select');
	let blends = [
		'normal',
		'multiply',
		'overlay',
		'darken',
		'lighten',
		'color-dodge',
		'color-burn',
		'hard-light',
		'soft-light',
		'difference',
		'exclusion',
		'hue',
		'saturation',
		'color',
		'luminosity'
	];
	
	let modes = [
		'clear',
		'copy',
		'destination',
		'source-over',
		'destination-over',
		'source-in',
		'destination-in',
		'source-out',
		'destination-out',
		'source-atop',
		'destination-atop',
		'xor',
		'lighter'
	];
	
	let blendsOptgroup = document.createElement('optgroup');
	blendsOptgroup.label = 'Blend Modes';
	
	blends.forEach(blend => {
		let option = document.createElement('option');
		option.value = blend;
		option.textContent = blend.replace('-', ' ');
		option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
		blendsOptgroup.appendChild(option);
	});
	
	let modesOptgroup = document.createElement('optgroup');
	modesOptgroup.label = 'Composite Modes';
	
	modes.forEach(mode => {
		let option = document.createElement('option');
		option.value = mode;
		option.textContent = mode.replace('-', ' ');
		option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
		modesOptgroup.appendChild(option);
	});
	
	selectEl.appendChild(blendsOptgroup);
	selectEl.appendChild(modesOptgroup);
	return selectEl;
};