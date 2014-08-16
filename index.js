var through = require('through2'),
    combine = require('stream-combiner'),
    _ = require('lodash'),
    fs = require('fs');

module.exports = function (fileName, moduleName) {
  if (!fileName) throw new PluginError('gulp-ng-config', 'Missing fileName option for gulp-ng-config');
  if (!moduleName) throw new PluginError('gulp-ng-config', 'Missing required moduleName option for gulp-ng-config');
  var outputFileStream = fs.createWriteStream(fileName),
      templateFile = fs.readFileSync(__dirname + '/template.html', 'utf8'),
      jsonReader,
      templater;

  jsonReader = through.obj(function (file, encoding, callback) {
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

    this.push(constants);
    callback();
  });

  templater = through.obj(function (chunk, encoding, callback) {
    var templateOutput = _.template(templateFile, {moduleName: moduleName, constants: chunk});
    this.push(templateOutput);
    callback();
  });

  return combine(jsonReader, templater, outputFileStream);
};
