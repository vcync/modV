(function(RJSmodule) {
	'use strict';
	/*jslint browser: true */

	// from here: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
	function getClosestWithClass(el, tag, classN) {
		tag = tag.toUpperCase();
		do {
			if (el.nodeName === tag && el.classList.contains(classN)) {
				return el;
			}
		} while (el = el.parentNode); // jshint ignore:line
	
		return false;
	}

	modV.prototype.ContainerGenerator = function(title, movable) {
		var self = this;

		var contTitle = title;
		var thatIn = self;

		self.div = document.createElement('div');
		self.div.classList.add('module');
		
		var header = document.createElement('header');
		var headerTxt = document.createTextNode(contTitle);

		var mover = document.createElement('div');
		mover.classList.add('mover');

		mover.draggable = true;
		mover.addEventListener('dragstart', function(e) {
			
			e.dataTransfer.setData('text', e.target.parentNode.parentNode.dataset.name);
			
		}, false);

		header.appendChild(headerTxt);

		if(movable) {
			header.appendChild(mover);

			self.div.addEventListener('drop', function(e) {
				e.preventDefault();
				var target = getClosestWithClass(e.target, 'div', 'module');
				target.style.backgroundColor = 'white';
				console.log(target);
				
				var targetdata = target.dataset.name;
				
				var data = e.dataTransfer.getData('text');
				var nodeToMove = modV.controllerWindow.document.querySelector('div.module[data-name="' + data + '"]');
				nodeToMove.parentNode.insertBefore(nodeToMove, target);
				
				modV.controllerWindow.window.opener.postMessage({type: 'setOrderFromElements', x: data, y: targetdata}, modV.options.controlDomain);
				
				console.log(nodeToMove);
			}, false);

			var relatedTarget;
			
			self.div.addEventListener('dragover', function(e) {
				e.preventDefault();
				relatedTarget = getClosestWithClass(e.target, 'div', 'module');
				
				try {
					relatedTarget.style.backgroundColor = 'green';
				} catch(err) {
					
				}
			}, false);
			
			self.div.addEventListener('dragleave', function(e) {
				e.preventDefault();
				relatedTarget.style.backgroundColor = 'white';
				
				//elem.parentNode.insertBefore(nodeToMove, );
			}, false);

		}

		self.div.appendChild(header);

		var elements = [];

		self.addInput = function(id, title, type, valueName, value, event, callback) {

			var element = document.createElement('input');
			element.type = type;

			if(valueName instanceof Array) {

				valueName.forEach(function(valueN, idx) {
					element[valueN] = value[idx];
				});

			} else {
				element[valueName] = value;
			}

			element.addEventListener(event, callback);
			element.id = contTitle + '-' + id;

			var container = document.createElement('div');
			container.classList.add('pure-g');

			var left = document.createElement('div');
			left.classList.add('pure-u-1-5');

			var label = document.createElement('label');
			label.setAttribute('for', contTitle + '-' + id);
			label.textContent = title;

			left.appendChild(label);

			var right = document.createElement('div');
			right.classList.add('pure-u-4-5');
			right.appendChild(element);

			container.appendChild(left);
			container.appendChild(right);

			elements.push(container);

		};

		self.addSpecial = function(element) {

			var container = document.createElement('div');
			container.classList.add('pure-g');

			var div = document.createElement('div');
			div.classList.add('pure-u-1-1');

			container.appendChild(div);
			div.appendChild(element);

			elements.push(container);

		};

		self.output = function() {
			elements.forEach(function(block) {
				thatIn.div.appendChild(block);
			});

			return self.div;
		};
	};

})(module);