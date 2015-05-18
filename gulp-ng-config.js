var through = require('through2'),
    gutil = require('gulp-util'),
    _ = require('lodash'),
    fs = require('fs'),
    jsYaml = require('js-yaml'),
    templateFilePath = __dirname + '/template.html',
    PluginError = gutil.PluginError;

const PLUGIN_NAME = 'gulp-ng-config',
      WRAP_TEMPLATE = '(function () { \n return <%= module %>\n})();\n';

function gulpNgConfig (moduleName, configuration) {
  var templateFile, stream, defaults;
  defaults = {
    createModule: true,
    wrap: false,
    environment: null,
    parser: null
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

    if (!configuration.parser && (_.endsWith(file.path, 'yml') || _.endsWith(file.path, 'yaml'))) {
      configuration.parser = 'yml';
    }

    if (!configuration.parser) {
      configuration.parser = 'json';
    }

    if (configuration.parser === 'json') {
      try {
        jsonObj = file.isNull() ? {} : JSON.parse(file.contents.toString('utf8'));
      } catch (e) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'invaild JSON file provided'));
      }
    } else if (configuration.parser === 'yml' || configuration.parser === 'yaml') {
      try {
        jsonObj = jsYaml.safeLoad(file.contents);
      } catch (e) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'invaild YML file provided'));
      }
    } else {
      this.emit('error', new PluginError(PLUGIN_NAME, configuration.parser + ' is not supported as a valid parser'));
    }

    if (!_.isPlainObject(jsonObj)) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'invalid JSON object provided'));
    }

    // select the environment in the configuration
    if (configuration.environment && jsonObj.hasOwnProperty(configuration.environment)) {
      jsonObj = jsonObj[configuration.environment];
    }

    jsonObj = _.merge({}, jsonObj, configuration.constants || {});

    _.each(jsonObj, function (value, key) {
      constants.push({
        name: key,
        value: JSON.stringify(value)
      });
    });

    templateOutput = _.template(templateFile)({
      createModule: configuration.createModule,
      moduleName: moduleName,
      constants: constants
    });

    if (configuration.wrap) {
      if (typeof configuration.wrap === 'string') {
        wrapTemplate = configuration.wrap;
      } else {
        wrapTemplate = WRAP_TEMPLATE;
      }
      templateOutput = _.template(wrapTemplate)({
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
