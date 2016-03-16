#Module2D

Module2D utilises the HTML5 Canvas API.

Take a look at the [Polygon Module](https://github.com/2xAA/modV/blob/master/modules/DemoNew.js) for a simple example of  Module2D.

## Using Module2D

To create a module using Module2D, we must first initialise a new instance

```JavaScript
var myModule = new modV.Module2D(settings);
```

In our settings object we provide information and functions to our Module.

We must provide the info and draw objects to our Module at least.

### settings.info

```JavaScript
settings.info = {
	name: 'My Module',			// Name of the Module
	author: '2xAA', 			// Author of Module
	version: 0.1, 				// Version of Module
	meyda: [], 					// Audio features
	previewWithOutput: false 	// Show Gallery preview with current output mixed or not
};
```

### settings.draw
The draw function takes in 7 arguments:

|Argument	|Type						|Info	|
|---		|---						|---	|
|canvas		|[HTMLCanvasElement](https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement)			|Main Canvas drawn to within modV|
|ctx		|[CanvasRenderingContext2D](https://developer.mozilla.org/en/docs/Web/API/CanvasRenderingContext2D)	|Context of the main Canvas|
|video		|[HTMLVideoElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement)			|The webcam source video element|
|features	|[Array](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array)						|Features requested by modules returned by Meyda|
|meyda		|[Meyda](github.com/hughrawlinson/meyda)						|The initialised Meyda object (for Windowing functions mainly)|
|delta		|[DOMHighResTimeStamp](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp)		|Returned by the requestAnimationFrame call|
|bpm		|[Number](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number)						|The approximate BPM of the audio source returned from [BeatDetektor](https://github.com/cjcliffe/beatdetektor)|


```JavaScript
settings.draw = function(canvas, ctx, video, features, meyda, delta, bpm) {
	// Example code
	var size = features['rms'] * 10 * this.intensity;
	var position = (canvas.width / 2) - (width/2);
	ctx.fillRect(position, position, size, size);
	ctx.fill(this.currentColor);
};

```

### settings.init
We can also set an initialisation function which is called upon the Module's creation in the active list.

The init function takes in 1 argument:

|Argument	|Type						|Info	|
|---		|---						|---	|
|canvas		|[HTMLCanvasElement](https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement)			|Main Canvas drawn to within modV|

```JavaScript
settings.init = function(canvas) {
	// Example code
	this.intensity = 15;
	this.currentColor = "red";
};
```

### settings.resize
We use the resize function to monitor viewPort size changes. This is useful if you're managing another canvas within your Module, for example.

The init function takes in 1 argument:

|Argument	|Type						|Info	|
|---		|---						|---	|
|canvas		|[HTMLCanvasElement](https://developer.mozilla.org/en/docs/Web/API/HTMLCanvasElement)			|Main Canvas drawn to within modV|

```JavaScript
settings.resize = function(canvas) {
	// ...resize code
};
```

### Module2D.add()
This method allows you to attach UI controls to the Module to modify public variables.

You may either add controls one by one such as:

```JavaScript
myModule.add(new modV.CheckboxControl(controlSettings));
```

Or use an array:

```JavaScript
var controls = [];
controls.push(new modV.CheckboxControl(controlSettings));
controls.push(new modV.RangeControl(otherControlSettings));
myModule.add(controls);
```
For more information on modV Controls, please check out the Controls page.

### Adding methods
You may augment the Module to add your own custom functions.

Check out the [Balls Module](https://github.com/2xAA/modV/blob/master/modules/Ball.js) for a good example of this.

```
// Larger local function
myModule.customFunction = function() {
	alert("I'm a custom function.");
};
```

### Register Module
To finish adding your Module to modV you must register it to the modV instance like so:

```
modV.register(myModule);

```

### File Format
Modules must be saved as JavaScript files in the 'module' folder with the extention '.modV.js' for modV to discover them.

###Module2D.getSettings()
Returns the settings Object.
