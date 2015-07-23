var bower = require('bower');
var bowerModules;

var path = require('path');
var through = require('through');
var falafel = require('falafel');

module.exports = function (file) {
  if (!/\.(js|coffee|ls)$/.test(file)) return through();
  var data = '';

  var tr = through(write, end);
  return tr;

  function write (buf) { data += buf; }
  function end () {
    if (bowerModules === undefined) {
      bower.commands.list({offline: true})
        .on('end', function (map) {
          bowerModules = map;
          next();
        });
    } else {
      next();
    }

    function next() {
      var output;
      try { output = parse(); }
      catch (err) {
        tr.emit('error', new Error(
          err.toString().replace('Error: ', '') + ' (' + file + ')')
        );
      }

      finish(output);
    }
  }

  function finish (output) {
    tr.queue(String(output));
    tr.queue(null);
  }

  function parse () {
    var output = falafel(data, function (node) {
      if (node.type === 'CallExpression' && node.callee.type === 'Identifier' && node.callee.name === 'require') {
        var moduleName = node.arguments[0].value;
        if (moduleName && moduleName in bowerModules.dependencies) {
          var module = bowerModules.dependencies[moduleName];
          if (module) {
            var mainModule;
            var pkgMeta = module.pkgMeta;
            if (pkgMeta && pkgMeta.main) {
              mainModule = Array.isArray(pkgMeta.main) ? pkgMeta.main[0] : pkgMeta.main;
            } else {
              // if 'main' wasn't specified by this component, let's try
              // guessing that the main file is moduleName.js
              mainModule = moduleName + '.js';
            }
            var fullModulePath = path.resolve(path.join(module.canonicalDir, mainModule));
            var relativeModulePath = './' + path.relative(path.dirname(file), fullModulePath);
            node.arguments[0].update(JSON.stringify(relativeModulePath));
          }
        }
      }
    });
    return output;
  }
};
