#Controls

###Range Control Object

```
{
	type: 'range', 					// String: module type
	variable: 'intensity',			// String: local variable to write input value to
	label: 'RMS/ZCR Intensity',		// String: label for control
	min: 0,							// Number: minimum number in range
	max: 30,						// Number: maximum number in range
	varType: 'int',					// String: must be "int" or "float"
	step: 1							// Number: the amount to increment on each step
}
```

###Text Control Object

```
{
	type: 'text',			// String: module type
	variable: 'message',	// String: local variable to write input value to
	label: 'Message'		// String: label for control
}
```

###Checkbox Control Object

```
{
	type: 'checkbox',							// String: module type
	variable: 'soundType',						// String: local variable to write input value to
	label: 'RMS (unchecked) / ZCR (checked)',	// String: label for control
	checked: true 								// Boolean: sets the default checked state
}
```

###Palette Control Object

```
{
	type: 'palette',		// String: module type
	variable: 'colour',		// String: local variable to write input value to
	colours: [				// Array: RGB colour values (0-255) in arrays. [RED, GREEN, BLUE]
		[255,102,152],
    	[255,179,102],
    	[255,255,102],
    	[152,255,102],
    	[102,152,255]
	],
	timePeriod: 500			/* Integer: the default number of milliseconds to cycle from one
                               colour to the next */
}

```

###Image Control Object
*The functionality of this is set to change in modV v1.0 to make the Drag and Drop functionality Obsolete in favour of the Media Manager and profiles.*

```
{
	type: 'image',							// String: module type
	variable: 'image',						// String: local variable to write input value to
	label: 'Drag and drop an image here'	// String: label for control
}
```

###Video Control Object
*The functionality of this is set to change in modV v1.0 to make the Drag and Drop functionality Obsolete in favour of the Media Manager and profiles.*

```
{
	type: 'video',							// String: module type
	variable: 'video',						// String: local variable to write input value to
	label: 'Drag and drop a video here'	// String: label for control
}
```

*The functionality of this is set to change in modV v1.0 to make the Drag and Drop functionality Obsolete in favour of the Media Manager and profiles.*

```
{
	type: 'multiimage',						// String: module type
	variable: 'images',						// String: local variable to write input value to
	label: 'Drag and drop images here'		// String: label for control
}

```

## Proposed modV v1.0 Control specs

###Range Control

```
var RangeControl = new modV.RangeControl({
	variable: 'amount', 	// String: local variable to write input value to
    label: 'Amount', 		// String: label for control
    varType: 'int', 		// String: must be "int" or "float"
    min: 1, 				// Number: minimum number in range
    max: 50, 				// Number: maximum number in range
    step: 1,				// Number: the amount to increment on each step
    default: 25 			/* (optional) Number: initiates local variable within Module
    						   (in this case "this.amount") */
});
```

###Text Control

```
var TextControl = new modV.TextControl({
	variable: 'message', 	// String: local variable to write input value to
    label: 'Amount', 		// String: label for control
    default: 25 			/* (optional) String: initiates local variable within Module
    						   (in this case "this.message") */
});
```

###Palette Control

```
var PaletteControl = new modV.PaletteControl({
	variable: 'colour',		/* String: local variable to write input value to.
						   	   Also initiates local variable within Module (in this case
						   	   "this.colour") with the first colour in the 'colours'
						   	   array below */
						   	   
	label: 'Amount', 		// String: label for control
	colours: [				// Array: RGB colour values (0-255) in arrays. [RED, GREEN, BLUE]
		[122,121,120],
		[135,203,172],
		[144,255,220],
		[141,228,255],
		[138,196,255]
	],
	timePeriod: 500			/* Integer: the default number of milliseconds to cycle from one
							   colour to the next */
});
```

###Checkbox Control

```
var CheckboxControl = new modV.CheckboxControl({
	variable: 'fillOrLine', 	// String: local variable to write input value to
    label: 'Fill/Line', 		// String: label for control
    checked: true 				/* (optional) Boolean: initiates local variable within Module
    							   (in this case "this.fillOrLine") */
});
```
###Image Control

```
var ImageControl = new modV.ImageControl({
	variable: 'image', 	// String: local variable to write input value to
    label: 'Image', 	// String: label for control
});
```
###Video Control

```
var VideoControl = new modV.VideoControl({
	variable: 'video', 	// String: local variable to write input value to
    label: 'Video', 	// String: label for control
});
```
###Multi-Image Control

```
var MultiImageControl = new modV.MultiImageControl({
	variable: 'images',		// String: local variable to write input value to
    label: 'Images', 		// String: label for control
    maxImages: 10			// Integer: maximum amount of images allowed
});
```

###Select Control

```
var SelectControl = new modV.SelectControl({
	variable: 'option',		// String: local variable to write input value to
    label: 'Type',			// String: label for control
    options: [				// Array: strings as options
    	'Type 1',
    	'Type 2',
    	'Type 3'
    ]
});
```

###Composite Operation Control
Gives the module author the ability to allow the user to choose another blend state elswhere in their module's draw loop. The author can then use the output of this with their local variable to modify [globalCompositeOperation](https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/globalCompositeOperation) to change the Composite Operation.

Usage:

```
var CompositeOperationControl = new modV.CompositeOperationControl({
	variable: 'secondBlendMode',	// String: local variable to write input value to
    label: 'Blend Mode 2',			// String: label for control
});
```

Example Module.draw code (following from above):

```
function draw(canvas, ctx, vars) {
	ctx.fillStyle = 'green';
	ctx.fillRect(
		canvas.width/2 - canvas.width/2,
		canvas.height/2 - canvas.height/2,
		canvas.width/2,
		canvas.height/2
	);
	
	ctx.fillStyle = 'red';
	ctx.globalCompositeOperation = this.secondBlendMode;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
}
```

