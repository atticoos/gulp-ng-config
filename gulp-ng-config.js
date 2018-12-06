'use strict';

var through = require('through2'),
    _ = require('lodash'),
    fs = require('fs'),
    jsYaml = require('js-yaml'),
    replaceExt = require('replace-ext'),
    PluginError = require('plugin-error'),
    VALID_TYPES = ['constant', 'value'],
    PLUGIN_NAME = 'gulp-ng-config',
    WRAP_TEMPLATE = '(function () { \n return <%= module %>\n})();\n',
    ES6_TEMPLATE = 'import angular from \'angular\';\nexport default <%= module %>';

function gulpNgConfig (moduleName, configuration) {
  var stream, defaults;
  defaults = {
    type: 'constant',
    createModule: true,
    wrap: false,
    environment: null,
    parser: null,
    pretty: false,
    keys: null,
    templateFilePath:  __dirname + '/template.html'
  };

  if (!moduleName) {
    throw new PluginError(PLUGIN_NAME, 'Missing required moduleName option for gulp-ng-config');
  }

  configuration = configuration || {};
  configuration = _.merge({}, defaults, configuration);

  stream = through.obj(function (file, encoding, callback) {
    var constants = [],
        templateFile,
        templateOutput,
        jsonObj,
        wrapTemplate,
        spaces,
        environmentKeys;

    try {
      templateFile = fs.readFileSync(configuration.templateFilePath || defaults.templateFilePath, 'utf8');
    } catch (error) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'invalid templateFilePath option, file not found'));
      return callback();
    }

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
        this.emit('error', new PluginError(PLUGIN_NAME, 'invalid JSON file provided'));
        return callback();
      }
    } else if (configuration.parser === 'yml' || configuration.parser === 'yaml') {
      try {
        jsonObj = jsYaml.safeLoad(file.contents);
      } catch (e) {
        this.emit('error', new PluginError(PLUGIN_NAME, 'invaild YML file provided'));
        return callback();
      }
    } else {
      this.emit('error', new PluginError(PLUGIN_NAME, configuration.parser + ' is not supported as a valid parser'));
      return callback();
    }

    if (!_.isPlainObject(jsonObj)) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'configuration file contains invalid JSON'));
      return callback();
    }

    // select the environment in the configuration
    if (configuration.environment) {
      // transform values into a flat array
      environmentKeys = [].concat(configuration.environment);

      // build the output based on the specifid keys
      jsonObj = environmentKeys.reduce(_.bind(function (obj, environmentKey) {
        var value = _.get(jsonObj, environmentKey);

        // if the key does not exist, raise an error.
        if (value === undefined) {
          this.emit('error', new PluginError(PLUGIN_NAME, 'invalid \'environment\' value'));
          return callback();
        }

        // add the value to the output object
        _.merge(obj, value);
        return obj;
      }, this), {});
    }

    if (!_.includes(VALID_TYPES, configuration.type)) {
      this.emit('error', new PluginError(PLUGIN_NAME, 'invalid \'type\' value'));
      return callback();
    }

    if (configuration.keys) {
      if (_.isArray(configuration.keys)) {
        jsonObj = _.pick(jsonObj, configuration.keys);
      } else {
        this.emit('error', new PluginError(PLUGIN_NAME, 'invalid \'keys\' value'));
        return callback();
      }
    }

    jsonObj = _.merge({}, jsonObj, configuration.constants || {});

    if (_.isUndefined(configuration.pretty) || configuration.pretty === false) {
      spaces = 0;
    } else if (configuration.pretty === true) {
      spaces = 2;
    } else if (!isNaN(configuration.pretty) && Number.isFinite(configuration.pretty)) {
      spaces = parseInt(configuration.pretty);
    } else {
      this.emit('error', new PluginError(
        PLUGIN_NAME,
        'invalid \'pretty\' value. Should be boolean value or an integer number'
      ));
      return callback();
    }

    _.each(jsonObj, function (value, key) {
      constants.push({
        name: key,
        value: JSON.stringify(value, null, spaces)
      });
    });

    templateOutput = _.template(templateFile)({
      createModule: configuration.createModule,
      moduleName: moduleName,
      type: configuration.type,
      constants: constants
    });

    if (configuration.wrap) {
      if (typeof configuration.wrap === 'string' &&
        (configuration.wrap.toUpperCase() === 'ES6' || configuration.wrap.toUpperCase() === 'ES2015')) {
        wrapTemplate = ES6_TEMPLATE;
      } else if (typeof configuration.wrap === 'string') {
        wrapTemplate = configuration.wrap;
      } else {
        wrapTemplate = WRAP_TEMPLATE;
      }
      templateOutput = _.template(wrapTemplate)({
        module: templateOutput
      });
    }

    file.path = replaceExt(file.path, '.js');
    file.contents = new Buffer(templateOutput);
    this.push(file);
    callback();
  });

  return stream;
}

module.exports = gulpNgConfig;
