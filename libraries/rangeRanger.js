var rangeRanger = function(rangeElement, settings) {
	settings = settings || {
		alt: {
			use: true,
			useCombo: false,
			modifier: 4,
			priority: 1
		},
		shift: {
			use: false,
			useCombo: false
		},
		ctrl: {
			use: false,
			useCombo: false
		},
		meta: {
			use: false,
			useCombo: false
		},
		combo: {
			use: false
		}
	};
	
	var stepValue = rangeElement.step || 1;
	var priority = [];
	var keys = ['alt', 'shift', 'ctrl', 'meta'];
	
	function checkKey(e, keyName) {
		var verdict;
		
		switch(keyName) {
			case 'alt':
				verdict = e.altKey;
				break;
			case 'shift':
				verdict = e.shiftKey;
				break;
			case 'ctrl':
				verdict = e.ctrlKey;
				break;
			case 'meta':
				verdict = e.metaKey;
				break;
		}
		
		return {keyName: keyName, pressed: verdict};
	}
	
	keys.forEach(key => {
		priority.splice(settings[key].priority-1, 0, key);
	});
	
	rangeElement.addEventListener('mousemove', function(e) {
		var anyKeyPressed = false;
		var keysPressed = [];
		var keysUsedForCombo = [];
		var modifier = stepValue;
		
		priority.forEach(keyName => {
			var key = checkKey(e, keyName);
			if(key.pressed) keysPressed.push(true);
			if(settings[key.keyName].useCombo) keysUsedForCombo.push(true);

			if(!key.pressed || !settings[key.keyName].use) return;
			anyKeyPressed = true;
			modifier = stepValue / settings[key.keyName].modifier;
		});
		
		if(settings.combo.use && keysPressed.length === keysUsedForCombo.length) {
			modifier = stepValue / settings.combo.modifier;
		}
		
		if(!anyKeyPressed) {
			rangeElement.step = stepValue;
		} else {
			rangeElement.step = modifier;
		}
	});

	rangeElement.addEventListener('mouseup', function(e) {
		rangeElement.step = stepValue;
	});
};