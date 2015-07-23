var shuffle = function() {
	
	this.info = {
		name: 'shuffle',
		author: '2xAA',
		version: 0.1,
		controls: [
			 {type: 'range', variable: 'gridSize', min: 1, max: 160, label: 'Grid Size', varType: 'int'}
		]
	};

	this.gridSize = 0;

	var canvas2 = document.createElement('canvas');
	var ctx2 = canvas2.getContext('2d');

	this.init = function(canvas) {
		if(this.gridSize === 0) {
			this.gridSize = 10;
		}
		canvas2.width = canvas.width;
		canvas2.height = canvas.height;
	};

	// http://bost.ocks.org/mike/shuffle/
	function shuff(array) {
		var currentIndex = array.length, temporaryValue, randomIndex ;

		// While there remain elements to shuffle...
		while (0 !== currentIndex) {

			// Pick a remaining element...
			randomIndex = Math.floor(Math.random() * currentIndex);
			currentIndex -= 1;

			// And swap it with the current element.
			temporaryValue = array[currentIndex];
			array[currentIndex] = array[randomIndex];
			array[randomIndex] = temporaryValue;
		}

		return array;
	}

	function numberArray(a,b){
		b=[];while(a--)b[a]=a+1;return b;
	}

	//var i=0;
	var arr = shuff(numberArray(this.gridSize));

	this.draw = function(canvas, ctx, audio, video, meyda) {


		for(var i=0; i<arr.length; i+=2) {
			ctx2.clearRect(0, 0, this.gridSize, this.gridSize);
			ctx2.drawImage(canvas, arr[i], arr[i], this.gridSize, this.gridSize, 0, 0, this.gridSize, this.gridSize);

			ctx.drawImage(canvas, arr[i+1], arr[i+1], this.gridSize, this.gridSize, arr[i], arr[i], this.gridSize, this.gridSize);
			ctx.drawImage(canvas2, 0, 0, this.gridSize, this.gridSize, arr[i+1], arr[i+1], this.gridSize, this.gridSize);
		}

		// if(i === arr.length) {
		// 	i=0;
		// 	arr = shuff(numberArray(this.gridSize));
		// }

	};

};