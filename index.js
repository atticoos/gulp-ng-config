var through = require('through2'),
    combine = require('stream-combiner'),
    _ = require('lodash'),
    fs = require('fs');

module.exports = function (fileName, moduleName, constantsObject) {
  if (!fileName) throw new PluginError('gulp-ng-config', 'Missing fileName option for gulp-ng-config');
  if (!moduleName) throw new PluginError('gulp-ng-config', 'Missing required moduleName option for gulp-ng-config');
  if (!_.isObject(constantsObject)) throw new PluginError('gulp-ng-config', 'Missing required constants option for gulp-ng-config');

  var outputFileStream = fs.createWriteStream(fileName),
      templateFile = fs.readFileSync(__dirname + '/template.html', 'utf8'),
      constants = [],
      jsonReader,
      templater;

  _.each(constantsObject, function (value, key) {
    value = JSON.stringify(value);
    constants.push({
      name: key,
      value: value
    });
  });

  jsonReader = through.obj(function (file, encoding, callback) {
    this.push(file.contents.toString('utf8'));
    callback();
  });

  templater = through(function (chunk, encoding, callback) {
    v = _.template(templateFile, {moduleName: moduleName, constants: constants});
    this.push(v);
    callback();
  });


  return combine(jsonReader, templater, outputFileStream);
};
