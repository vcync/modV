# debowerify

A browserify transform to enable the easy use of [bower](https://bower.io) components in browserify client javascript projects.

This can be used in conjunction with [deamdify](https://github.com/jaredhanson/deamdify) to require AMD components from bower as well.

NB: For more information about how to use debowerify to create stand-alone library bundles
check out [bower-resolve](https://github.com/eugeneware/bower-resolve) and the 
examples in the README.

[![build status](https://secure.travis-ci.org/eugeneware/debowerify.png)](http://travis-ci.org/eugeneware/debowerify)

## Installation

Installation is via npm:

```
$ npm install debowerify
```

## How to use.

Install some bower components:

```
# creates files in components/screenfull/
$ bower install screenfull
```

Require the bower file by it's bower identifier (ie. in this case "screenfull"):

``` js
// public/scripts/app.js
var _screenfull = require('screenfull'); // the bower component
var domready = require('domready'); // a regular browserify npm component

domready(function () {
  var button = document.getElementById('fullscreen');
  button.addEventListener('click', function (evt) {
    // screenfull adds itself to window.screenfull - but we can get to it
    if (screenfull.enabled) {
      screenfull.toggle(this);
    }
  });
});
```

Build out your browserify bundle using the debowerify transform:

```
$ browserify -t debowerify  public/scripts/app.js -o public/scripts/build/bundle.js
```

Then include your bundle.js in your HTML file and you're done!

# How to use with AMD components

If your bower components are amd and they don't support commonjs modules than simply use debowerify with the excellent [deamdify](https://github.com/jaredhanson/deamdify) browserify transform. For example, the following AMD bower import:

```
# creates files in components/myamdcomponent/
$ bower install myamdcomponent
```

``` js
// public/scripts/amdapp.js
var myamdcomponent = require('myamdcomponent'); // the AMD bower component
var domready = require('domready'); // a regular browserify npm component

domready(function () {
  // call the amd component
  myamdcomponent.doStuff();
});
```

To make this all magically work and use the short-form bower name of "amdcomponent" chain both debowerify and deamdify together like this:

```
$ browserify -t debowerify -t deamdify public/scripts/amdapp.js -o public/scripts/build/bundle.js
```

Too easy!

# Notes

The transform depends on the "main" entry in bower.json to be correct.

Some bower components may not have this set, or have it set incorrectly. In this case, either manually update the bower.json file yourself, of just do a require to the relevant full path of the bower javascript file - and then complain to the bower component repo owner! :-)
