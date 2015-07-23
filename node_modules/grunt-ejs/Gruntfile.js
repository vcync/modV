module.exports = function(grunt) {
  'use strict';

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

  grunt.registerTask('default', ['ejs']);
};
