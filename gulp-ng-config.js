var through = require('through2'),
    gutil = require('gulp-util'),
    _ = require('lodash'),
    fs = require('fs'),
    templateFilePath = __dirname + '/template.html',
    PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-ng-config';

function gulpNgConfig (moduleName, overridableProperties) {
  var templateFile, stream;

  if (!moduleName) {
    throw new PluginError(PLUGIN_NAME, 'Missing required moduleName option for gulp-ng-config');
  }

  templateFile = fs.readFileSync(templateFilePath, 'utf8');
  overridableProperties = overridableProperties || {};

  stream = through.obj(function (file, encoding, callback) {
    var constants = [],
        templateOutput,
        jsonObj;

    try {
      jsonObj = JSON.parse(file.contents.toString('utf8'));
    } catch (e) {
      throw new PluginError(PLUGIN_NAME, 'invaild JSON file provided');
    }

    if (!_.isPlainObject(jsonObj)) {
      throw new PluginError(PLUGIN_NAME, 'invalid JSON object provided');
    }

    jsonObj = _.merge(jsonObj, overridableProperties);

    _.each(jsonObj, function (value, key) {
      constants.push({
        name: key,
        value: JSON.stringify(value)
      });
    });

    templateOutput = _.template(templateFile, {moduleName: moduleName, constants: constants});
    file.path = gutil.replaceExtension(file.path, '.js');
    file.contents = new Buffer(templateOutput);
    this.push(file);
    callback();
  });

  return stream;
}

module.exports = gulpNgConfig;
