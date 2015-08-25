(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	modV.prototype.registerMod = function(Mod) {
		var self = this;

		var mod = new Mod();
		mod.defaults = [];
		if(typeof mod.init === 'function') mod.init(self.canvas, self.context);
		if(!('blend' in mod.info)) mod.info.blend = 'normal';
		if(!('alpha' in mod.info)) mod.info.alpha = 1;
		mod.info.disabled = true;
		
		if(self.meydaSupport && ('meyda' in mod.info)) {
			mod.info.meyda.forEach(self.addMeydaFeature);
		} else if(!self.meydaSupport && ('meyda' in mod.info)) {
			console.warn('Whilst registering the module \'' + mod.info.name + '\', modV detected it requests Meyda which has not been included on the page. You may encounter problems using this module without Meyda.');
		}

		var fieldset = document.createElement('fieldset');
		
		var container = new self.ContainerGenerator(mod.info.name, true);
		
		var relatedTarget = null;
		
		fieldset.addEventListener('dragleave', function(e) {
			e.preventDefault();
			relatedTarget.style.backgroundColor = 'white';
			
			//elem.parentNode.insertBefore(nodeToMove, );
		}, false);

		container.div.dataset.name = mod.info.name;
		
		fieldset.dataset.name = mod.info.name;
		fieldset.style.position = 'relative';
		var legend = document.createElement('legend');
		legend.textContent = mod.info.name;
		legend.style.fontSize = '20px';
		fieldset.appendChild(legend);

		fieldset.appendChild(document.createElement('br'));

		container.addInput('enabled', 'Enabled', 'checkbox', 'checked', false, 'change', function() {
			self.controllerWindow.window.opener.postMessage({type: 'check',
				modName: mod.info.name,
				payload: this.checked
			}, self.options.controlDomain);

			if(self.options.remote) {
				try {
					self.ws.send(JSON.stringify({
						type: 'ui-enabled',
						modName: mod.info.name,
						payload: this.checked
					}));
				} catch(e) {

				}
			}
		});

		container.addInput('opacity', 'Opacity', 'range', ['value', 'min', 'max', 'step'], [mod.info.alpha, 0, 1, 0.01], 'input', function() {
			self.controllerWindow.window.opener.postMessage({
				type: 'modOpacity',
				modName: mod.info.name,
				payload: this.value
			}, self.options.controlDomain);

			if(self.options.remote) {
				self.ws.send(JSON.stringify({
					type: 'ui-opacity',
					modName: mod.info.name,
					payload: this.value
				}));
			}
		});
		
		// Add Blending options
		var blendCompSelect = self.genBlendModeOps();
		var label = document.createElement('label');
		label.textContent = 'Blending ';
		
		blendCompSelect.addEventListener('change', function() {
			self.controllerWindow.window.opener.postMessage({
				type: 'modBlend',
				modName: mod.info.name,
				payload: this.value
			}, self.options.controlDomain);

			if(self.options.remote) {
				self.ws.send(JSON.stringify({
					type: 'ui-blend',
					modName: mod.info.name,
					payload: this.value
				}));
			}
		});
		
		blendCompSelect.id = mod.info.name + '-blend';

		label.appendChild(blendCompSelect);
		container.addSpecial(label);

		//fieldset.appendChild(label);
		//fieldset.appendChild(document.createElement('br'));
		
		var mover = document.createElement('div');
		mover.classList.add('mover');
		mover.classList.add('instant');
		// Move this:
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
		
		mover.draggable = true;
		mover.addEventListener('dragstart', function(e) {
			
			e.dataTransfer.setData('text', e.target.parentNode.dataset.name);
			
		}, false);
		
		mover.addEventListener('dragend', function(e) {
			//console.log(e.target);
			//e.dataTransfer.setData("text", e.target.parentNode.dataset.name);
		}, false);
		//fieldset.appendChild(mover);
		
		var variables = [];

		// Register controls
		if('controls' in mod.info) {

			mod.info.controls.forEach(function(controlSet, idx) {
				mod.defaults.push(JSON.parse(JSON.stringify(controlSet))); // ugly, but we need to copy the set, not ref it.

				var variable = controlSet.variable;
				variables.push(variable);
				var label = document.createElement('label');
				var labelText = controlSet.label;
				label.textContent = labelText + ' ';
				
				fieldset.appendChild(document.createElement('hr'));
				var image;

				if(controlSet.type === 'video') {
					image = new Image();
					image.src = mod[variable].src;

					label.classList.add('filedrop');

					label.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					label.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					label.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/video.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						self.controllerWindow.window.opener.postMessage({type: 'video', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, self.options.controlDomain);
						mod[variable].play();
					});

					label.appendChild(image);

					container.addSpecial(label);

				} else if(controlSet.type === 'image') {
					image = new Image();
					image.src = mod[variable].src;

					label.classList.add('filedrop');

					label.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					label.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					label.addEventListener('drop', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
						var file = e.dataTransfer.files[0];
						if (!file || !file.type.match(/image.*/)) return;
						var imageURL = window.URL.createObjectURL(file);
						self.controllerWindow.window.opener.postMessage({type: 'image', modName: mod.info.name, name: variable, payload: imageURL, index: idx}, self.options.controlDomain);
						image.src = imageURL;
					});

					label.appendChild(image);

					container.addSpecial(label);

				} else if(controlSet.type === 'multiimage') {

					image = new Image();
					//image.src = mod[variable][0].src;

					label.classList.add('filedrop');

					label.addEventListener('dragover', function(e) {
						e.preventDefault();
						this.classList.add('dragover');
					});

					label.addEventListener('dragend', function(e) {
						e.preventDefault();
						this.classList.remove('dragover');
					});
						
					label.addEventListener('drop', function(e) {
						e.preventDefault();
						var altPressed = e.altKey;
						this.classList.remove('dragover');
						var files = e.dataTransfer.files;
						var images = [];
						for(var i = 0, file; (file = files[i]); i++) {
							if (!file || !file.type.match(/image.*/)) continue;
							var imageURL = window.URL.createObjectURL(file);
							image.src = imageURL;
							images.push(imageURL);
						}
						
						self.controllerWindow.window.opener.postMessage({
							type: 'multiimage',
							modName: mod.info.name,
							name: variable,
							payload: images,
							wipe: altPressed,
							index: idx
						}, self.options.controlDomain);
					});



					label.appendChild(image);

					container.addSpecial(label);
				
				} else if(controlSet.type === 'palette') {

					mod.info.controls[idx].currValue = mod[variable];
					mod.defaults[idx].currValue = mod[variable];

					var pal = self.Palette(
						mod.info.controls[idx].colours,
						mod.info.controls[idx].timePeriod,
						{
							init: function(colours) {
								mod.info.controls[idx].currValue = JSON.stringify(colours);
							},
							next: function(colour) {
								mod[variable] = colour;
							},
							add: function(colours) {
								mod.info.controls[idx].currValue = JSON.stringify(colours);
								console.log('added', colours);
							},
							remove: function(colours) {
								mod.info.controls[idx].currValue = JSON.stringify(colours);
								console.log('removed', colours);
							}
						}
					);

					var palControls = pal.generateControls();
					container.addSpecial(palControls);

				} else if(controlSet.type === 'checkbox') {
					
					mod.info.controls[idx].currValue = mod[variable];
					mod.defaults[idx].currValue = mod[variable];

					container.addInput(controlSet.variable.toLowerCase().replace(/\s+/g, ''),
						controlSet.label,
						controlSet.type,
						'checked',
						controlSet.checked,
						'change',
						function() {
							console.log('checkbox changed');
							self.controllerWindow.window.opener.postMessage({
								type: 'variable',
								varType: controlSet.type,
								modName: mod.info.name,
								name: variable,
								payload: this.checked,
								index: idx
							}, self.options.controlDomain);

							if(self.options.remote) {
								self.ws.send(JSON.stringify({
									type: 'ui',
									varType: controlSet.varType,
									modName: mod.info.name,
									name: variable,
									payload: this.checked,
									index: idx
								}));
							}
						}
					);
				
				} else {
					var varr;
					if('append' in controlSet) {
						varr = mod[variable].replace(controlSet.append, '');
					} else {
						varr = mod[variable];
					}

					mod.info.controls[idx].currValue = mod[variable];
					mod.defaults[idx].currValue = varr;

					container.addInput(controlSet.variable.toLowerCase().replace(/\s+/g, ''),
						controlSet.label,
						controlSet.type,
						['value', 'min', 'max', 'step'],
						[varr, controlSet.min, controlSet.max, controlSet.step],
						'input',
						function() {

							if('append' in controlSet) {
								var value = (this.value + controlSet.append);
								self.controllerWindow.window.opener.postMessage({
									type: 'variable',
									varType: controlSet.varType,
									modName: mod.info.name,
									name: variable,
									payload: value,
									index: idx,
									append: controlSet.append
								}, self.options.controlDomain);

								if(self.options.remote) {
									self.ws.send(JSON.stringify({
										type: 'ui',
										varType: controlSet.varType,
										modName: mod.info.name,
										name: variable,
										payload: value,
										index: idx,
										append: controlSet.append
									}));
								}
							}
							else {
								self.controllerWindow.window.opener.postMessage({
									type: 'variable',
									varType: controlSet.varType,
									modName: mod.info.name,
									name: variable,
									payload: this.value,
									index: idx
								}, self.options.controlDomain);

								if(self.options.remote) {
									self.ws.send(JSON.stringify({
										type: 'ui',
										varType: controlSet.varType,
										modName: mod.info.name,
										name: variable,
										payload: this.value,
										index: idx
									}));
								}
							}
						}
					);
				}

				fieldset.appendChild(document.createElement('br'));
			});

		}

		self.controllerWindow.document.body.appendChild(container.output());

		var registered = self.registeredMods[mod.info.name] = mod;
		self.setModOrder(mod.info.name, Object.size(self.registeredMods));
		
		if(self.options.remote && self.ws) {
			self.ws.send({type: 'register', payload: mod.info});
		}
		
		return registered;	
	};

})(module);