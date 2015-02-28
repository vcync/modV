function modVRemote(ip) {
	var $				= document,
		registeredMods	= {},
		remoteSuccess 	= false,
		wsURL 			= 'ws://' + ip + ':8888/ws',
		ws				= new WebSocket(wsURL),
		uuid;
	
	ws.onmessage = function(e) {
		var data = JSON.parse(e.data);
		console.group('WebSocket logs');
		console.log('Message received:', data);
		
		if(!('type' in data)) return false;
		
		var pl = data.payload;
		
		switch(data.type) {
			
			case 'hello':
				console.log(pl.name, 'says hi. Server version number:', pl.version);
				uuid = pl.id;
				remoteSuccess = true;
				ws.send(JSON.stringify({type: 'declare', payload: {type: 'remote', id: uuid}}));
				break;
				
			case 'register':
				console.log('Server wants to register', pl.name, 'at order number', pl.index);
				
				registerMod(pl);
				
				break;

			case 'ui':
				var payload = data.payload;
				if('append' in data) {
					payload = payload.replace(data.append, '');
				}

				var id = data.modName + '-' + data.name;
				var node = document.getElementById(id);
				
				console.log(id, node, data.payload, node.value);
						
				if(data.varType === 'checkbox') {
					node.checked = payload;
				} else {
					node.value = payload;
				}

				break;

			case 'ui-blend':
				var id = data.modName + '-blend';
				var node = document.getElementById(id);
				console.log(id, node, data.payload);

				for (var i = 0; i < node.options.length; i++) {
					if (node.options[i].value === data.payload) {
						node.selectedIndex = i;
						break;
					}
				}

				break;

			case 'ui-enabled':
				var id = data.modName + '-enabled';
				var node = document.getElementById(id);
				console.log(id, node, data.payload);
				node.checked = data.payload;

				break;

			case 'ui-opacity':
				var id = data.modName + '-opacity';
				var node = document.getElementById(id);
				console.log(id, node, data.payload);
				node.value = data.payload;

				break;
			
		}
		console.groupEnd();
	};

	ws.onclose = function() {
		console.group('WebSocket logs');
		console.log('Connection closed');
		console.groupEnd();
	};

	ws.onopen = function() {
		console.group('WebSocket logs');
		console.log('Successful inital connection to', wsURL);
		console.groupEnd();
	};



	
	// Slip
	var ol = $.getElementsByTagName('ol')[0];
			
	ol.addEventListener('slip:beforereorder', function(e) {
		if (/demo-no-reorder/.test(e.target.className)) {
			e.preventDefault();
		}
	}, false);
	
	ol.addEventListener('slip:beforewait', function(e) {
		if (e.target.className.indexOf('instant') > -1) e.preventDefault();
	}, false);

	ol.addEventListener('slip:reorder', function(e) {
		console.log(e);
		e.target.parentNode.insertBefore(e.target, e.detail.insertBefore);

		var src = e.target.childNodes[0].dataset.name;
		var to = e.detail.insertBefore.childNodes[0].dataset.name;

		console.log(src, to);

		ws.send(JSON.stringify({type: 'setOrderFromElements', x: src, y: to}));

		return false;
	}, false);
	
	ol.addEventListener('slip:beforeswipe', function(e) {
		e.preventDefault();
	}, false);
	
	new Slip(ol);
	// end Slip



	
	// from here: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
	function getClosest(el, tag) {
		tag = tag.toUpperCase();
		do {
			if (el.nodeName === tag) {
				return el;
			}
		} while (el = el.parentNode);
		
		return false;
	}
	
	// Function to create blend mode options
	function genBlendModeOps() {
		var selectEl = document.createElement('select');
		var blends = [
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
		
		var modes = [
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
		
		var blendsOptgroup = document.createElement('optgroup');
		blendsOptgroup.label = 'Blend Modes';
		
		blends.forEach(function(blend) {
			var option = document.createElement('option');
			option.value = blend;
			option.textContent = blend.replace('-', ' ');
			option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
			blendsOptgroup.appendChild(option);
		});
		
		var modesOptgroup = document.createElement('optgroup');
		modesOptgroup.label = 'Composite Modes';
		
		modes.forEach(function(mode) {
			var option = document.createElement('option');
			option.value = mode;
			option.textContent = mode.replace('-', ' ');
			option.textContent = option.textContent.charAt(0).toUpperCase() + option.textContent.slice(1);
			modesOptgroup.appendChild(option);
		});
		
		selectEl.appendChild(blendsOptgroup);
		selectEl.appendChild(modesOptgroup);
		return selectEl;
	}
	
	function registerMod(mod) {
		
		if(mod.name in registeredMods) return mod.name;
		
		var fieldset = document.createElement('fieldset');
		
		fieldset.dataset.name = mod.name;
		fieldset.style.position = 'relative';
		var legend = document.createElement('legend');
		legend.textContent = mod.name;
		legend.style .fontSize = '20px';
		fieldset.appendChild(legend);

		var label = document.createElement('label');
		label.textContent = 'Enabled ';

		var checkbox = document.createElement('input');
		checkbox.type = 'checkbox';
		checkbox.checked = mod.enabled || false;
		checkbox.addEventListener('change', function() {
			ws.send(JSON.stringify({type: 'check', modName: mod.name, payload: this.checked}));
			
		});

		checkbox.id = mod.name + '-enabled';

		label.appendChild(checkbox);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		var up = document.createElement('button');
		up.textContent = 'UP';
		up.addEventListener('click', function() {
			ws.send(JSON.stringify({type: 'setOrderUp', modName: mod.name}));
		});
		
		fieldset.appendChild(up);
		fieldset.appendChild(document.createElement('br'));
		
		// Add Opacity control
		var opacityInput = document.createElement('input');
		opacityInput.type = 'range';
		
		label = document.createElement('label');
		label.textContent = 'Opacity ';

		opacityInput.min = 0;
		opacityInput.max = 1;
		opacityInput.step = 0.01;
		opacityInput.value = mod.alpha;
		opacityInput.id = mod.name + '-opacity';
		
		opacityInput.addEventListener('input', function() {
			ws.send(JSON.stringify({type: 'modOpacity', modName: mod.name, payload: this.value}));
		});
		
		label.appendChild(opacityInput);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		// Add Blending options
		var blendCompSelect = genBlendModeOps();
		label = document.createElement('label');
		label.textContent = 'Blending ';
		
		blendCompSelect.addEventListener('change', function() {
			ws.send(JSON.stringify({type: 'modBlend', modName: mod.name, payload: this.value}));
		});

		blendCompSelect.id = mod.name + '-blend';

		if(mod.blend) {
			for (var i = 0; i < blendCompSelect.options.length; i++) {
				if (blendCompSelect.options[i].value === mod.blend) {
					blendCompSelect.selectedIndex = i;
					break;
				}
			}
		}
		
		label.appendChild(blendCompSelect);
		fieldset.appendChild(label);
		fieldset.appendChild(document.createElement('br'));
		
		var mover = document.createElement('div');
		mover.classList.add('mover');
		mover.classList.add('instant');
		// Delete this:
		mover.style.width = '50px';
		mover.style.height = '50px';
		mover.style.borderRadius = '50%';
		mover.style.backgroundColor = 'red';
		mover.style.textAlign = 'center';
		mover.style.fontSize = '44px';
		mover.style.color = 'white';
		mover.style.position = 'absolute';
		mover.style.right = '-8px';
		mover.style.top = '-8px';
		
		//mover.draggable = true;
		mover.addEventListener('dragstart', function(e) {
			
			e.dataTransfer.setData('text', e.target.parentNode.dataset.name);
			
		}, false);
		
		mover.addEventListener('dragend', function(e) {
			//console.log(e.target);
			//e.dataTransfer.setData("text", e.target.parentNode.dataset.name);
			
		}, false);
		fieldset.appendChild(mover);
		

		// Register controls
		if('controls' in mod) {

			mod.controls.forEach(function(controlSet, idx) {
				var variable = controlSet.variable;
				var label = document.createElement('label');
				var labelText = controlSet.label;
				label.textContent = labelText + ' ';
				
				label.oncontextmenu = function(e) {
					console.log(e);
					var div = document.createElement('div');
					div.classList.add('menu');
					div.style.top = e.clientY + e.offsetY + 'px';
					div.style.left = e.clientX + e.offsetX + 'px';
					$.body.appendChild(div);
					return false;
				 };
				
				
				fieldset.appendChild(document.createElement('hr'));
				
				if(controlSet.type === 'video') {
					var image = new Image();
					image.src = mod[variable].src;

					fieldset.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					fieldset.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					fieldset.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/video.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						ws.send(JSON.stringify({type: 'video', modName: mod.name, name: variable, payload: imageURL, index: idx}));
						mod[variable].play();
					});

					label.appendChild(image);

				} else if(controlSet.type === 'image') {
					var image = new Image();
					try {
						image.src = mod[variable].src;
					} catch(e) {
						
					}

					fieldset.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					fieldset.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					fieldset.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/image.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						ws.send(JSON.stringify({type: 'image', modName: mod.name, name: variable, payload: imageURL, index: idx}));
						image.src = imageURL;
					});

					label.appendChild(image);

				} else if(controlSet.type === 'multiimage') {

					var image = new Image();
					//image.src = mod[variable][0].src;

					fieldset.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					fieldset.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					fieldset.addEventListener('drop', function(e) {
						e.preventDefault();
						var altPressed = e.altKey;
						this.classList.remove('dragover');
						var files = e.dataTransfer.files;
						var images = [];
						for(var i = 0, file; file = files[i]; i++) {
							if (!file || !file.type.match(/image.*/)) continue;
							var imageURL = window.URL.createObjectURL(file);
							image.src = imageURL;
							images.push(imageURL);
						}
						
						ws.send(JSON.stringify({
							type: 'multiimage',
							modName: mod.name,
							name: variable,
							payload: images,
							wipe: altPressed,
							index: idx
						}));
					});

					label.appendChild(image);
				
				} else if(controlSet.type === 'checkbox') {
					
					var type = 'checkbox';

					var input = document.createElement('input');
					input.type = type;
					input.id = mod.name + '-' + variable;

					if('checked' in controlSet) input.checked = controlSet.checked;

					input.addEventListener('change', function() {
						ws.send(JSON.stringify({
							type: 'variable',
							varType: type,
							modName: mod.name,
							name: variable,
							payload: input.checked,
							index: idx
						}));
					});

					label.appendChild(input);
				
				} else {
					
					var type = controlSet.type;

					var input = document.createElement('input');
					input.type = type;
					input.id = mod.name + '-' + variable;

					if('min' in controlSet) input.min = controlSet.min;
					if('max' in controlSet) input.max = controlSet.max;
					if('step' in controlSet) input.step = controlSet.step;
					if(!('varType' in controlSet)) input.varType = 'string';
					if('append' in controlSet) {
						input.value = mod.controls[idx].currValue.replace(controlSet.append, '');
					} else {
						input.value = mod.controls[idx].currValue;
					}

					input.addEventListener('input', function() {
						if('append' in controlSet) {
							var value = (input.value + controlSet.append);
							ws.send(JSON.stringify({
								type: 'variable',
								varType: controlSet.varType,
								modName: mod.name,
								name: variable,
								payload: value,
								index: idx,
								append: controlSet.append
							}));
						}
						else {
							ws.send(JSON.stringify({
								type: 'variable',
								varType: controlSet.varType,
								modName: mod.name,
								name: variable,
								payload: input.value,
								index: idx
							}));
						}
					});

					label.appendChild(input);
				}

				fieldset.appendChild(label);
				fieldset.appendChild(document.createElement('br'));
			});

		}
		
		var li = $.createElement('li');
		li.appendChild(fieldset);
		ol.appendChild(li);
		
		var registered = registeredMods[mod.name] = mod;
		
		return registered;
	}
	
}