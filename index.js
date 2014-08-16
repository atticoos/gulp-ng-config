var through = require('through2'),
    combine = require('stream-combiner'),
    gutil = require('gulp-util'),
    _ = require('lodash'),
    fs = require('fs');

module.exports = function (moduleName) {
  if (!moduleName) throw new PluginError('gulp-ng-config', 'Missing required moduleName option for gulp-ng-config');
  var templateFile = fs.readFileSync(__dirname + '/template.html', 'utf8'),
      jsonReader,
      templater;

  return through.obj(function (file, encoding, callback) {
    var constants = [],
        jsonObj;
    try {
      jsonObj = JSON.parse(file.contents.toString('utf8'));
    } catch (e) {
      throw new PluginError('gulp-ng-config', 'invaild JSON file provided');
    }

    _.each(jsonObj, function (value, key) {
      value = JSON.stringify(value);
      constants.push({
        name: key,
        value: value
      });
    });

    var templateOutput = _.template(templateFile, {moduleName: moduleName, constants: constants});
    file.path = gutil.replaceExtension(file.path, '.js');
    file.contents = new Buffer(templateOutput);
    this.push(file);
    callback();
  });
};
