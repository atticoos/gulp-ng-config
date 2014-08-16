var through = require('through2'),
    combine = require('stream-combiner'),
    gutil = require('gulp-util'),
    _ = require('lodash'),
    fs = require('fs'),
    templateFilePath = __dirname + '/template.html';


function gulpNgConfig(moduleName, overridableProperties) {
  if (!moduleName) throw new PluginError('gulp-ng-config', 'Missing required moduleName option for gulp-ng-config');
  var templateFile = fs.readFileSync(templateFilePath, 'utf8'),
      overridableProperties = overridableProperties || {};

  var stream = through.obj(function (file, encoding, callback) {
    var constants = [],
        jsonObj;
    try {
      jsonObj = JSON.parse(file.contents.toString('utf8'));
    } catch (e) {
      throw new PluginError('gulp-ng-config', 'invaild JSON file provided');
    }

    jsonObj = _.assign(jsonObj, overridableProperties);

    _.each(jsonObj, function (value, key) {
      constants.push({
        name: key,
        value: JSON.stringify(value)
      });
    });

    var templateOutput = _.template(templateFile, {moduleName: moduleName, constants: constants});
    file.path = gutil.replaceExtension(file.path, '.js');
    file.contents = new Buffer(templateOutput);
    this.push(file);
    callback();
  });


  return stream;
};

module.exports = gulpNgConfig;
