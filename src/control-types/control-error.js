module.exports = function(controlType) {

	function ControlError(message) {
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
		this.name = `modV.${controlType} Error`;
		this.message = message + ' ' + stackInfo || 'Error';
	}

	// Inherit from Error
	ControlError.prototype = Object.create(Error.prototype);
	ControlError.prototype.constructor = ControlError;

	return ControlError;
};