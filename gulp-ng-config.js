var through = require('through2'),
    gutil = require('gulp-util'),
    _ = require('lodash'),
    fs = require('fs'),
    templateFilePath = __dirname + '/template.html',
    PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-ng-config',
      WRAP_TEAMPLTE = '(function () { \n return <%= module %>\n})();\n';

function gulpNgConfig (moduleName, configuration) {
  var templateFile, stream, defaults;
  defaults = {
    createModule: true,
    wrap: false
  };

  if (!moduleName) {
    throw new PluginError(PLUGIN_NAME, 'Missing required moduleName option for gulp-ng-config');
  }

  templateFile = fs.readFileSync(templateFilePath, 'utf8');
  configuration = configuration || {};
  configuration = _.merge({}, defaults, configuration);

  stream = through.obj(function (file, encoding, callback) {
    var constants = [],
        templateOutput,
        jsonObj,
        wrapTemplate;

    try {
      jsonObj = JSON.parse(file.contents.toString('utf8'));
    } catch (e) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'invaild JSON file provided'));
    }

    if (!_.isPlainObject(jsonObj)) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'invalid JSON object provided'));
    }

    jsonObj = _.merge({}, jsonObj, configuration.constants || {});

    _.each(jsonObj, function (value, key) {
      constants.push({
        name: key,
        value: JSON.stringify(value)
      });
    });

    templateOutput = _.template(templateFile, {
      createModule: configuration.createModule,
      moduleName: moduleName,
      constants: constants
    });

    if (configuration.wrap) {
      if (typeof configuration.wrap === 'string') {
        wrapTemplate = configuration.wrap;
      } else {
        wrapTemplate = WRAP_TEAMPLTE;
      }
      templateOutput = _.template(wrapTemplate, {
        module: templateOutput
      });
    }

    file.path = gutil.replaceExtension(file.path, '.js');
    file.contents = new Buffer(templateOutput);
    this.push(file);
    callback();
  });

  return stream;
}

module.exports = gulpNgConfig;
