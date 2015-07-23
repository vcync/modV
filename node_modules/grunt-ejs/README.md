# grunt-ejs

A Grunt task for compiling [ejs](http://npmjs.org/package/ejs) templates.

## Getting Started

Install this grunt plugin next to your project's
[Gruntfile.js](http://gruntjs.com/getting-started) with: `npm install grunt-ejs --save-dev`.

Then add this line to your project's `Gruntfile.js`:

```javascript
grunt.loadNpmTasks('grunt-ejs');
```

## Documentation

Add the task to your config and specify the destination for the compiled file:

```javascript
grunt.initConfig({
  ejs: {
    all: {
      src: ['app/**/*.ejs', '!app/partials/**/*'],
      dest: 'dist/',
      expand: true,
      ext: '.html',
    },
  },
});
```

## Release History

* 0.1.0 initial release

## License

Copyright (c) 2013 Kyle Robinson Young
Licensed under the MIT license.
