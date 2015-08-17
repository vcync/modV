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
        tasks: ['ejs', 'tags'],
      },

      js: {
        files: '<%= browserify.all.src %>',
        tasks: ['browserify', 'tags'],
      },

      assets: {
        files: ['assets/**/*', '*.css', '*.js', 'images/**/*', 'img/**/*', '!Gruntfile.js'],
        tasks: ['copy', 'tags'],
      },

      modules: {
        files: ['modules/**/*', '*.js'],
        tasks: ['copy', 'tags'],
      },
    },

    'gh-pages': {
      options: {
        base: 'dist/'
      },
      src: ['**/*']
    },

    // This automatically loads modV modules if they're in the 'modules' folder
    tags: {
      build: {
        options: {
          scriptTemplate: '<script src="{{ path }}"></script>',
          openTag: '<!-- modV modules load -->',
          closeTag: '<!-- between these tags -->'
        },
        src: [
          'modules/*.modV.js'
        ],
        dest: 'dist/index.html'
      }
    }
  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  
  grunt.registerTask('default', ['clean', 'ejs', 'browserify', 'copy', 'tags']);
  
  grunt.registerTask('server', ['default', 'connect', 'watch']);

  grunt.registerTask('deploy', ['default', 'gh-pages']);

};