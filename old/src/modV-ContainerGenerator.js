// from here: http://stackoverflow.com/questions/18663941/finding-closest-element-without-jquery
function getClosestWithClass(el, tag, classN) {
	tag = tag.toUpperCase();
	do {
		if (el.nodeName === tag && el.classList.contains(classN)) {
			return el;
		}
	} while (el = el.parentNode);  // jshint ignore:line

	return false;
}

module.exports = function(modV) {
	/* Constructor */
	modV.prototype.ContainerGenerator = function(title, movable, controllerWindow, controlDomain) {
		let self = this;

		let contTitle = title;

		self.div = document.createElement('div');
		self.div.classList.add('module');
		
		let header = document.createElement('header');
		let headerTxt = document.createTextNode(contTitle);

		let mover = document.createElement('div');
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
				let target = getClosestWithClass(e.target, 'div', 'module');
				target.style.backgroundColor = 'white';
				
				let targetdata = target.dataset.name;
				
				let data = e.dataTransfer.getData('text');
				let nodeToMove = controllerWindow.document.querySelector('div.module[data-name="' + data + '"]');
				nodeToMove.parentNode.insertBefore(nodeToMove, target);
				
				controllerWindow.window.opener.postMessage({type: 'setOrderFromElements', x: data, y: targetdata}, controlDomain);
			}, false);

			let relatedTarget;
			
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

		let elements = [];

		self.addInput = function(id, title, type, valueName, value, event, callback) {

			let element = document.createElement('input');
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

			let container = document.createElement('div');
			container.classList.add('pure-g');

			let left = document.createElement('div');
			left.classList.add('pure-u-1-5');

			let label = document.createElement('label');
			label.setAttribute('for', contTitle + '-' + id);
			label.textContent = title;

			left.appendChild(label);

			let right = document.createElement('div');
			right.classList.add('pure-u-4-5');
			right.appendChild(element);

			container.appendChild(left);
			container.appendChild(right);

			elements.push(container);

		};

		self.addSpecial = function(element) {

			let container = document.createElement('div');
			container.classList.add('pure-g');

			let div = document.createElement('div');
			div.classList.add('pure-u-1-1');

			container.appendChild(div);
			div.appendChild(element);

			elements.push(container);

		};

		self.output = function() {
			elements.forEach(function(block) {
				self.div.appendChild(block);
			});

			return self.div;
		};
	};
};