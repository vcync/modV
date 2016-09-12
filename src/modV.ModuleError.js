//jslint browser: true 
modV.prototype.ModuleError = function(message) {
	// Grab the stack
	this.stack = (new Error()).stack;

	// Parse the stack for some helpful debug info
	var reg = /\((.*?)\)/;    
	var stackInfo = this.stack.split('\n').pop().trim();
	try {
	stackInfo = reg.exec(stackInfo)[0];
	} catch(e) {

	}

	// Expose name and message
	this.name = 'modV.Module Error';
	this.message = message + ' ' + (stackInfo || '');
};