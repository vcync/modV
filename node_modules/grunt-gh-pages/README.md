# grunt-gh-pages
**Publish to GitHub Pages with Grunt**

Use [Grunt](http://gruntjs.com/) to push to your `gh-pages` branch hosted on GitHub or any other branch anywhere else.

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-gh-pages --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-gh-pages');
```

## The `gh-pages` task

### Overview
In your project's Gruntfile, add a section named `gh-pages` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'gh-pages': {
    options: {
      // Task-specific options go here.
    },
    src: ['index.html', 'js/**/*', 'css/**/*', 'img/**/*']
  }
});
```

Running this task with `grunt gh-pages` will create a temporary clone of the current repository, create a `gh-pages` branch if one doesn't already exist, copy over all files specified in the `src` configuration, commit all changes, and push to the `origin` remote.

If a `gh-pages` branch already exists, it will be updated with all commits from the remote before adding any commits from the provided `src` files.  **Note** that any files in the `gh-pages` branch that are *not* in the `src` files **will be removed**.

The `gh-pages` task is a multi-task, so different targets can be configured with different `src` files and `options`.  For example, to have the `gh-pages:gh-pages` target push to `gh-pages` and a second `gh-pages:foo` target push to a `bar` branch, the multi-task could be configured as follows:

```js
grunt.initConfig({
  'gh-pages': {
    options: {
      // Options for all targets go here.
    },
    'gh-pages': {
      // These files will get pushed to the `gh-pages` branch (the default).
      src: ['index.html']
    },
    'foo': {
      options: {
        branch: 'bar'
      },
      // These files will get pushed to the `bar` branch.
      src: ['other.txt']
    }
  }
});
```


### Options

The default task options should work for most cases.  The options described below let you push to alternate branches, customize your commit messages, and more.

#### options.base
 * type: `String`
 * default: `process.cwd()`

The base directory for all source files (those listed in the `src` config property).  By default, source files are assumed to be relative to the current working directory, and they will be copied to the target with this relative path.  If your source files are all in a different directory (say, `build`), and you want them to be copied with a path relative to that directory, provide the directory path in the `base` option (e.g. `base: 'build'`).

#### options.repo
 * type: `String`
 * default: remote url for current dir (assumes a git repository)

By default, the `gh-pages` task assumes that the current working directory is a git repository, and that you want to push changes to a remote (default is `'origin'`) associated with the same repository.  This is the most common case - your `Gruntfile.js` builds static resources and the `gh-pages` task pushes them to a remote.

If instead your `Gruntfile.js` is not in a git repository, or if you want to push to a remote configured in another repository, you can provide the repository URL in the `repo` option.

#### options.git
 * type: `String`
 * default: `'git'`

Your `git` executable.

#### options.clone
 * type: `String`
 * default: `'.grunt/grunt-gh-pages/gh-pages/repo'`

Path to a directory where your repository will be cloned.  If this directory doesn't already exist, it will be created.  If it already exists, it is assumed to be a clone of your repository.  If you stick with the default value (recommended), you will likely want to add `.grunt` to your `.gitignore` file.

#### options.branch
 * type: `String`
 * default: `'gh-pages'`

The name of the branch you'll be pushing to.  The default uses GitHub's `gh-pages` branch, but this same task can be used to push to any branch on any remote.

#### options.remote
 * type: `String`
 * default: `'origin'`

This only needs to be set if you are not using the default `options.clone` value and you have a clone already configured with a different remote name.

#### options.message
 * type: `String`
 * default: `'Updates'`

The commit message for all commits.

#### options.user
 * type: `Object`
 * default: `null`

If you are running the `gh-pages` task in a repository without a `user.name` or `user.email` git config properties (or on a machine without these global config properties), you must provide user info before git allows you to commit.  The `options.user` object accepts `name` and `email` string values to identify the committer.

#### options.push
 * type: `Boolean`
 * default: `true`
 
Push branch to remote.  To commit only (with no push) set to `false`.

#### options.tag
 * type: `String`
 * default: ``

A tag added to commit. If the repository already has a commit with this tag then tagging step will be ignored. 


[![Current Status](https://secure.travis-ci.org/tschaub/grunt-gh-pages.png?branch=master)](https://travis-ci.org/tschaub/grunt-gh-pages)
