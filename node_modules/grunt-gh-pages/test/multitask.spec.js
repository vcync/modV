var fs = require('fs');
var path = require('path');

var chai = require('chai');

var helper = require('./helper');


/** @type {boolean} */
chai.Assertion.includeStack = true;
var assert = chai.assert;

describe('multitask', function() {
  var fixture, repo1, repo2;

  before(function(done) {
    this.timeout(3000);
    helper.buildFixture('multitask', function(error, dir) {
      fixture = dir;
      repo1 = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/first');
      repo2 = path.join(fixture, '.grunt/grunt-gh-pages/gh-pages/second');
      done(error);
    });
  });

  after(function(done) {
    helper.afterFixture(fixture, done);
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/first directory', function(done) {
    fs.stat(repo1, function(error, stats) {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });

  it('creates .grunt/grunt-gh-pages/gh-pages/second directory', function(done) {
    fs.stat(repo2, function(error, stats) {
      assert.isTrue(!error, 'no error');
      assert.isTrue(stats.isDirectory(), 'directory');
      done(error);
    });
  });

  it('pushes the gh-pages branch to remote', function(done) {
    helper.git(['ls-remote', '--exit-code', '.', 'origin/gh-pages'], repo1)
        .then(function() {
          done();
        })
        .fail(done);
  });

  it('pushes the branch-two branch to remote', function(done) {
    helper.git(['ls-remote', '--exit-code', '.', 'origin/branch-two'], repo2)
        .then(function() {
          done();
        })
        .fail(done);
  });

});
