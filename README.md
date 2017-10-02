# gulp-ng-config

[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://npmjs.org/package/gulp-ng-config)
[![NPM version](http://img.shields.io/npm/v/gulp-ng-config.svg?style=flat)](https://npmjs.org/package/gulp-ng-config)
[![NPM version](http://img.shields.io/npm/dm/gulp-ng-config.svg?style=flat)](https://npmjs.org/package/gulp-ng-config)
[![Build Status](http://img.shields.io/travis/ajwhite/gulp-ng-config.svg?style=flat)](http://travis-ci.org/ajwhite/gulp-ng-config)
[![Coverage Status](https://coveralls.io/repos/ajwhite/gulp-ng-config/badge.svg?branch=develop&service=github)](https://coveralls.io/github/ajwhite/gulp-ng-config?branch=develop)
[![Code Climate](https://codeclimate.com/github/ajwhite/gulp-ng-config/badges/gpa.svg)](https://codeclimate.com/github/ajwhite/gulp-ng-config)
[![Dependency Status](http://img.shields.io/gemnasium/ajwhite/gulp-ng-config.svg?style=flat)](https://gemnasium.com/ajwhite/gulp-ng-config)

[![NPM](https://nodei.co/npm/gulp-ng-config.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/gulp-ng-config/)

It's often useful to generate a file of constants, usually as environment variables, for your Angular apps.
This Gulp plugin will allow you to provide an object of properties and will generate an Angular module of constants.

## To Install:
`npm install gulp-ng-config`

## How it works
It's pretty simple:
`gulpNgConfig(moduleName)`


## Example Usage
We start with our task. Our source file is a JSON file containing our configuration. We will pipe this through `gulpNgConfig` and out will come an angular module of constants.
```javascript
var gulp = require('gulp');
var gulpNgConfig = require('gulp-ng-config');

gulp.task('test', function () {
  gulp.src('configFile.json')
  .pipe(gulpNgConfig('myApp.config'))
  .pipe(gulp.dest('.'))
});
```
Assume that `configFile.json` contains:
```json
{
  "string": "my string",
  "integer": 12345,
  "object": {"one": 2, "three": ["four"]},
  "array": ["one", 2, {"three": "four"}, [5, "six"]]
}
```
Running `gulp test` will take `configFile.json` and produce `configFile.js` with the following content:

```js
angular.module('myApp.config', [])
.constant('string', "my string")
.constant('integer', 12345)
.constant('object', {"one":2,"three":["four"]})
.constant('array', ["one",2,{"three":"four"},[5,"six"]]);
```
We now can include this configuration module in our main app and access the constants
```js
angular.module('myApp', ['myApp.config']).run(function (string) {
  console.log("The string constant!", string) // outputs "my string"
});
```


## Configuration
Currently there are a few configurable options to control the output of your configuration file:
- [options.environment](#options.environment)
- [options.constants](#options.constants)
- [options.createModule](#options.createModule)
- [options.type](#options.type)
- [options.wrap](#options.wrap)
- [options.parser](#options.parser)
- [options.pretty](#options.pretty)
- [options.keys](#options.keys),
- [options.templateFilePath](#options.templateFilePath)

### <a id="options.environment"></a>options.environment
Type: `String` Optional

If your configuration contains multiple environments, you can supply the key you want the plugin to load from your configuration file.

Example `config.json` file with multiple environments:
```json
{
  "local": {
    "EnvironmentConfig": {
      "api": "http://localhost/"
    }
  },
  "production": {
    "EnvironmentConfig": {
      "api": "https://api.production.com/"
    }
  }
}
```

Usage of the plugin:
```js
gulpNgConfig('myApp.config', {
  environment: 'production'
})
```

Expected output:
```js
angular.module('myApp.config', [])
.constant('EnvironmentConfig', {"api": "https://api.production.com/"});
```

#### Nested Environment
If the configuration is nested it can be accessed by the namespace, for example
```json
{
  "version": "0.1.0",
  "env": {
    "local": {
      "EnvironmentConfig": {
        "api": "http://localhost/"
      }
    },
    "production": {
      "EnvironmentConfig": {
        "api": "https://api.production.com/"
      }
    }
  }
}
```

Usage of the plugin:
```js
gulpNgConfig('myApp.config', {
  environment: 'env.production'
})
```

Expected output:
```js
angular.module('myApp.config', [])
.constant('EnvironmentConfig', {"api": "https://api.production.com/"});
```

#### Multiple Environment keys
Multiple environment keys can be supplied in an array, for example for global and environmental constants
```json
{
  "global": {
    "version": "0.1.0"
   },
  "env": {
    "local": {
      "EnvironmentConfig": {
        "api": "http://localhost/"
      }
    },
    "production": {
      "EnvironmentConfig": {
        "api": "https://api.production.com/"
      }
    }
  }
}
```

Usage of the plugin:
```js
gulpNgConfig('myApp.config', {
  environment: ['env.production', 'global']
})
```

Expected output:
```js
angular.module('myApp.config', [])
.constant('EnvironmentConfig', {"api": "https://api.production.com/"});
.constant('version', '0.1.0');
```

### <a id="options.constants"></a>options.constants
Type: `Object` Optional

You can also override properties from your json file or add more by including them in the gulp tasks:
```javascript
gulpNgConfig('myApp.config', {
  constants: {
    string: 'overridden',
    random: 'value'
  }
});
```
Generating `configFile.js`
```js
angular.module('myApp.config', [])
.constant('string', "overridden")
.constant('integer', 12345)
.constant('object', {"one":2,"three":["four"]})
.constant('array', ["one",2,{"three":"four"},[5,"six"]])
.constant('random', "value");

```

### <a id="options.type"></a>options.type
Type: `String` Default value: `'constant'` Optional

This allows configuring the type of service that is created -- a `constant` or a `value`. By default, a `constant` is created, but a `value` can be overridden. Possible types:

- `'constant'`
- `'value'`

```javascript
gulpNgConfig('myApp.config', {
  type: 'value'
});
```

This will produce `configFile.js` with a `value` service.
```javascript
angular.module('myApp.config', [])
.value('..', '..');
```

### <a id="options.createModule"></a>options.createModule
Type: `Boolean` Default value: `true` Optional

By default, a new module is created with the name supplied. You can access an existing module, rather than creating one, by setting `createModule` to false.
```javascript
gulpNgConfig('myApp.config', {
  createModule: false
});
```

This will produce `configFile.js` with an existing angular module
```javascript
angular.module('myApp.config')
.constant('..', '..');
```

### <a id="options.wrap"></a>options.wrap
Type: `Boolean` or `String` Default value: `false` Optional

Presets:
- `ES6`
- `ES2015`

Wrap the configuration module in an IIFE or your own wrapper.

```js
gulpNgConfig('myApp.config', {
  wrap: true
})
```

Will produce an IIFE wrapper for your configuration module:
```javascript
(function () {
  return angular.module('myApp.config') // [] has been removed
  .constant('..', '..');
})();
```

You can provide a custom wrapper. Provide any string you want, just make sure to include `<%= module %>` for where you want to embed the angular module.
```js
gulpNgConfig('myApp.config', {
  wrap: 'define(["angular"], function () {\n return <%= module %> \n});'
});
```

The reuslting file will contain:
```js
define(["angular"], function () {
 return angular.module('myApp.config', [])
.constant('..', '..');
});
```

### <a id="options.parser"></a>options.parser
Type: `String` Default value: 'json' Optional

By default, json file is used to generate the module. You can provide yml file to generate the module. Just set `parser` to `'yml'` or `'yaml'`. If your file type is yml and you have not defined `parser`, your file will still be parsed and js be generated correctly.
For example, you have a `config.yml` file,
```yml
string: my string
integer: 12345
object:
  one: 2
  three:
    - four
```

```javascript
gulp.src("config.yml")
.pipe(gulpNgConfig('myApp.config', {
  parser: 'yml'
}));
```

Generating,
```js
angular.module('myApp.config', [])
.constant('string', "my string")
.constant('integer', 12345)
.constant('object', {"one":2,"three":["four"]});
```

### <a id="options.pretty"></a>options.pretty
Type: `Number|Boolean` Default value: `false` Optional

This allows `JSON.stringify` to produce a `pretty` formatted output string.

```js
gulp.src('config.json')
.pipe(gulpNgConfig('myApp.config', {
  pretty: true // or 2, 4, etc -- all representing the number of spaces to indent
}));
```

Will output a formatted `JSON` object in the constants, instead of inline.
```js
angular.module("gulp-ng-config", [])
.constant("one", {
  "two": "three"
});
```

### <a id="options.keys"></a>options.keys
Type: `Array` Optional

If you only want some of the keys from the object imported, you can supply the keys you want the plugin to load.

Example `config.json` file with unwanted keys:
```json
{
  "version": "0.0.1",
  "wanted key": "wanted value",
  "unwanted key": "unwanted value"
}
```

Usage of the plugin:
```js
gulpNgConfig("myApp.config", {
  keys: ["version", "wanted key"]
})
```

Expected output:
```js
angular.module("myApp.config", [])
.constant("version", "0.0.1")
.constant("wanted key", "wanted value");
```

### <a id="options.templateFilePath"></a>options.templateFilePath
Type: `String` Optional

This allows the developer to provide a custom output template.

Sample template:
`angularConfigTemplate.html`
```html
var foo = 'bar';

angular.module("<%= moduleName %>"<% if (createModule) { %>, []<% } %>)<% _.forEach(constants, function (constant) { %>
.<%= type %>("<%= constant.name %>", <%= constant.value %>)<% }); %>;
```

Configuration:
```json
{
  "Foo": "bar"
}
```

Gulp task:
```js
gulp.src('config.json')
.pipe(gulpNgConfig('myApp.config', {
  templateFilePath: path.normalize(path.join(__dirname, 'templateFilePath.html'))
}));
```

Sample output:
```js
var foo = 'bar';

angular.module('myApp.config', [])
.constant('Foo', 'bar');
```

## Additional Usages

### Without a json/yaml file on disk
Use `buffer-to-vinyl` to create and stream a vinyl file into `gulp-ng-config`. Now config values can come from environment variables, command-line arguments or anywhere else.

```js
var b2v = require('buffer-to-vinyl');
var gulpNgConfig = require('gulp-ng-config');

gulp.task('make-config', function() {
  var json = JSON.stringify({
    // your config here
  });

  return b2v.stream(new Buffer(json), 'config.js')
    .pipe(gulpNgConfig('myApp.config'))
    .pipe(gulp.dest('build'));
});
```

### ES6/ES2015
An ES6/ES2015 template can be generated by passing `wrap: true` as a configuration to the plugin

## Contributing
Contributions, issues, suggestions, and all other remarks are welcomed. To run locally just fork &amp; clone the project and run `npm install`. Before submitting a Pull Request, make sure that your changes pass `gulp test`, and if you are introducing or changing a feature, that you add/update any tests involved.
