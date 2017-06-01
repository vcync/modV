function STError(message) {
	// Grab the stack
	this.stack = (new Error()).stack;

	// Parse the stack for some helpful debug info
	var reg = /\((.*?)\)/;    
	var stackInfo = this.stack.split('\n').pop().trim();
	try {
		stackInfo = reg.exec(stackInfo)[0];
	} catch(e) {
		// Could not get stack
	}

	// Expose name and message
	this.name = 'Error';
	this.message = (message + ' ' + stackInfo) || 'Error'; 
}
// Inherit from Error
STError.prototype = Object.create(Error.prototype);
STError.prototype.constructor = STError;
window.STError = STError;