var path = require('path');

var Q = require('q');
var fs = require('q-io/fs');

var pkg = require('../package.json');
var git = require('../lib/git');

// copy files to a destination directory
function copy(files, base, dest) {
  return Q.all(files.map(function(file) {
    var absolute = path.resolve(base, file);
    var relative = path.relative(base, absolute);
    var target = path.join(dest, relative);
    return fs.makeTree(path.dirname(target)).then(function() {
      return fs.copy(absolute, target);
    });
  }));
}

function getRepo(options) {
  if (options.repo) {
    return Q.resolve(options.repo);
  } else {
    var repo;
    return git(['config', '--get', 'remote.' + options.remote + '.url'],
        process.cwd())
        .progress(function(chunk) {
          repo = String(chunk).split(/[\n\r]/).shift();
        })
        .then(function() {
          if (repo) {
            return Q.resolve(repo);
          } else {
            return Q.reject(new Error(
                'Failed to get repo URL from options or current directory'));
          }
        })
        .fail(Q.reject);
  }
}


/** @param {Object} grunt Grunt. */
module.exports = function(grunt) {

  grunt.registerMultiTask('gh-pages', 'Publish to gh-pages.', function() {

    var src;
    var data = this.data;
    var kind = grunt.util.kindOf(data);
    if (kind === 'string') {
      src = [data];
    } else if (kind === 'array') {
      src = data;
    } else if (kind === 'object') {
      if (!('src' in data)) {
        grunt.fatal(new Error('Required "src" property missing.'));
      }
      src = data.src;
    } else {
      grunt.fatal(new Error('Unexpected config: ' + String(data)));
    }

    var options = this.options({
      git: 'git',
      clone: path.join('.grunt', pkg.name, this.name, this.target),
      branch: 'gh-pages',
      remote: 'origin',
      base: process.cwd(),
      only: grunt.option(pkg.name + '-only') || '.',
      push: true,
      message: 'Updates'
    });

    if (!grunt.file.isDir(options.base)) {
      grunt.fatal(new Error('The "base" option must be an existing directory'));
    }

    var files = grunt.file.expand({filter: 'isFile', cwd: options.base}, src);
    var only = grunt.file.expand({cwd: options.base}, options.only);

    if (!Array.isArray(files) || files.length === 0) {
      grunt.fatal(new Error('Files must be provided in the "src" property.'));
    }

    var done = this.async();

    git.exe(options.git);

    getRepo(options)
        .then(function(repo) {
          grunt.log.writeln('Cloning ' + repo + ' into ' + options.clone);
          return git.clone(repo, options.clone);
        })
        .then(function() {
          // only required if someone mucks with the checkout between builds
          grunt.log.writeln('Cleaning');
          return git.clean(options.clone);
        })
        .then(function() {
          grunt.log.writeln('Fetching ' + options.remote);
          return git.fetch(options.remote, options.clone);
        })
        .then(function() {
          grunt.log.writeln('Checking out ' + options.remote + '/' +
              options.branch);
          return git.checkout(options.remote, options.branch,
              options.clone);
        })
        .then(function() {
          grunt.log.writeln('Removing files');
          return git.rm(only.join(' '), options.clone);
        })
        .then(function() {
          grunt.log.writeln('Copying files');
          return copy(files, options.base, options.clone);
        })
        .then(function() {
          grunt.log.writeln('Adding all');
          return git.add('.', options.clone);
        })
        .then(function() {
          if (options.user) {
            return git(['config', 'user.email', options.user.email],
                options.clone)
                .then(function() {
                  return git(['config', 'user.name', options.user.name],
                      options.clone);
                });
          } else {
            return Q.resolve();
          }
        })
        .then(function() {
          grunt.log.writeln('Committing');
          return git.commit(options.message, options.clone);
        })
        .then(function() {
          if (options.tag) {
            grunt.log.writeln('Tagging');
            var deferred = Q.defer();
            git.tag(options.tag, options.clone)
              .then(function() {
                  return deferred.resolve();
                })
              .fail(function(error) {
                  // tagging failed probably because this tag alredy exists
                  grunt.log.writeln('Tagging failed, continuing');
                  grunt.log.debug(error);
                  return deferred.resolve();
                });
            return deferred.promise;
          } else {
            return Q.resolve();
          }
        })
        .then(function() {
          if (options.push) {
            grunt.log.writeln('Pushing');
            return git.push(options.remote, options.branch,
                options.clone);
          } else {
            return Q.resolve();
          }
        })
        .then(function() {
          done();
        }, function(error) {
          done(error);
        }, function(progress) {
          grunt.verbose.writeln(progress);
        });
  });

};
