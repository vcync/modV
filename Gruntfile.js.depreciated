console.log('      modV Copyright  (C)  2016 Sam Wray      '+ "\n" +
            '----------------------------------------------'+ "\n" +
            '      modV is licensed  under GNU GPL V3      '+ "\n" +
            'This program comes with ABSOLUTELY NO WARRANTY'+ "\n" +
            'For details, see LICENSE within this directory'+ "\n" +
            '----------------------------------------------');
module.exports = function(grunt) {
  grunt.initConfig({
    concurrent: {
        target1: ['coffee', 'sass'],
        target2: ['jshint', 'mocha']
    },

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
        src: ['*.css', '*.html', 'images/**/*', 'img/**/*', '!Gruntfile.js', 'fonts/**/*'],
        dest: 'dist/',
      },
      main: {
        files: [
          {expand: true, src: ['modules/**'], dest: 'dist/'},
          {expand: true, src: ['libraries/**'], dest: 'dist/'},
          {expand: false, src: ['node_modules/meyda/dist/web/meyda.js'], dest: 'dist/libraries/meyda.min.js'},
          {expand: false, src: ['LICENSE'], dest: 'dist/LICENSE'}
        ]
      }
    },

    browserify: {
      all: {
        src: 'src/**/*.js',
        dest: 'dist/app.js'
      },
      options: {
        transform: [
          'debowerify'
        ]
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
        tasks: ['ejs'/*, 'tags'*/],
      },

      js: {
        files: '<%= browserify.all.src %>',
        tasks: ['browserify'/*, 'tags'*/],
      },

      assets: {
        files: ['assets/**/*', '*.css', '*.html', '*.js', 'images/**/*', 'img/**/*', '!Gruntfile.js', 'libraries/**/*'],
        tasks: ['copy'/*, 'tags'*/],
      },

      modules: {
        files: ['modules/**/*', '*.js'],
        tasks: ['copy'/*, 'tags'*/],
      },
    },

    'gh-pages': {
      options: {
        base: 'dist/'
      },
      src: ['**/*']
    },

    // This automatically loads modV modules if they're in the 'modules' folder
/*    tags: {
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
    },*/

    // Creates symlink to media folder in dist because we're not gonna copy potentially hundreds of MBs
    symlink: {
      options: {
        overwrite: false
      },
      expanded: {
        files: [
          // All child files and directories in "source", starting with "foo-" will
          // be symlinked into the "build" directory, with the leading "source"
          // stripped off.
          {
            expand: true,
            overwrite: false,
            cwd: 'media',
            src: ['*'],
            dest: 'dist/media'
          }
        ]
      }
    },

    // Copies Bower components to dist

    bower: {
      dev: {
        dest: 'dist/libraries'
      }
    },

    // Runs media manager
    execute: {
        target: {
            src: ['mediaManager.js']
        }
    }

  });

  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  
  grunt.loadNpmTasks('grunt-bower'); // ???

  grunt.registerTask('default', ['clean', 'ejs', 'browserify', 'copy', /*'tags',*/ 'symlink', 'bower']);
  
  grunt.registerTask('server', ['default', 'connect', 'execute', 'watch']);

  grunt.registerTask('no-manager', ['default', 'connect', 'watch']);

  grunt.registerTask('deploy', ['default', 'gh-pages']);

};