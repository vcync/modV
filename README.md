# modV

modV is a modular audio visualisation framework written in JavaScript.
Some goals of this project:

  - To find the fastest way to render
  - More goals
  - even more goals (ambitious, huh?)

Okay, modV is still in alpha(ish) and so these docs aren't complete as of yet - as you may be able to tell :s

##How to run:
###Requirements

Browser: Google Chrome desktop

OS: any that support desktop Chrome.

Device specs: UNKNOWN. modV was developed on a Late 2011 MBP with 16GB of RAM installed - so let me know how you get on with your specs.

Web server or local server to host the project
Check this guide out to help you spin one up on your Mac:
http://lifehacker.com/start-a-simple-web-server-from-any-directory-on-your-ma-496425450

###Using
Using modV is fairly straightforward.

You must allow popups and also the userMedia request to access both webcam and audio input as modV abstracts both to be used within its modules.

Twiddle settings until you get the desired output.

You can drag the red balls at the side to reorder the modules up and down.

Some modules allow images, to change the images drag and drop a new one on.

Some modules allow multiple images, such as starField.
Hold ALT as you drag to remove the previous images and overwrite with the new images, drag normally to add onto the images previous.

You can just load up the example index.html to get a good feel of how the modules have to be loaded and modV setup.

*will expand at some point*
###Developing
The modules were built to reflect Processing, with a few quirks.

There has to be this basic layout or your module WILL NOT work:

```JavaScript
var modName = function() {

	this.info = {
		name: 'modName',
		author: '2xAA'
	};
		
	this.draw = function(canvas, ctx) {
			
	};
};
modName = new modName();
```

Please see the bundled modules for extra stuff.

*will expand*