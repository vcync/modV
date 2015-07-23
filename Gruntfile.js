module.exports = function(grunt) {
  grunt.initConfig({
    
    clean: ['dist'],

    ejs: {
      all: {
        options: {
          // site-wide vars here
        },
        src: ['**/*.ejs', '!node_modules/**/*', '!_*/**/*'],
        dest: 'dist/',
        expand: true,
        ext: '.html',
      },
    },

    copy: {
      all: {
        src: ['*.css', '*.html', 'images/**/*', 'img/**/*', '!Gruntfile.js'],
        dest: 'dist/',
      },
      main: {
        files: [
          {expand: true, src: ['modules/**'], dest: 'dist/'},
          {expand: true, src: ['libraries/**'], dest: 'dist/'}
        ]
      }
    },

    browserify: {
      all: {
        src: 'src/**/*.js',
        dest: 'dist/app.js'
      },
      options: {
        transform: ['debowerify']
      }
    },

    connect: {
      options: {
        port: process.env.PORT || 3131,
        base: 'dist/',
      },

      all: {},
    },

    watch: {
      options: {
        livereload: true
      },

      html: {
        files: '<%= ejs.all.src %>',
        tasks: ['ejs'],
      },

      js: {
        files: '<%= browserify.all.src %>',
        tasks: ['browserify'],
      },

      assets: {
        files: ['assets/**/*', '*.css', '*.js', 'images/**/*', 'img/**/*', '!Gruntfile.js'],
        tasks: ['copy'],
      },

      modules: {
        files: ['modules/**/*', '*.js'],
        tasks: ['copy'],
      }
    },

    'gh-pages': {
      options: {
        base: 'dist/'
      },
      src: ['**/*']
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  
  grunt.registerTask('default', ['clean', 'ejs', 'browserify', 'copy']);
  
  grunt.registerTask('server', ['default', 'connect', 'watch']);

  grunt.registerTask('deploy', ['default', 'gh-pages']);

};