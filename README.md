#gulp-ng-config

[![License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](https://npmjs.org/package/gulp-ng-config)
[![NPM version](http://img.shields.io/npm/v/gulp-ng-config.svg?style=flat)](https://npmjs.org/package/gulp-ng-config)
[![NPM version](http://img.shields.io/npm/dm/gulp-ng-config.svg?style=flat)](https://npmjs.org/package/gulp-ng-config)
[![Build Status](http://img.shields.io/travis/ajwhite/gulp-ng-config.svg?style=flat)](http://travis-ci.org/ajwhite/gulp-ng-config)
[![Dependency Status](http://img.shields.io/gemnasium/ajwhite/gulp-ng-config.svg?style=flat)](https://gemnasium.com/ajwhite/gulp-ng-config)

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
- [options.wrap](#options.wrap)
- [options.parser](#options.parser)

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
.contant('EnvironmentConfig', {"api": "https://api.production.com/"});
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
 return angular.module('myApp.config')
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
gulpNgConfig('myApp.config', {
  parser: 'yml'
});
```

Generating,
```js
angular.module('myApp.config', [])
.constant('string', "my string")
.constant('integer', 12345)
.constant('object', {"one":2,"three":["four"]});
```

## Contributing
Contributions, issues, suggestions, and all other remarks are welcomed. To run locally just fork &amp; clone the project and run `npm install`. Before submitting a Pull Request, make sure that your changes pass `gulp test`, and if you are introducing or changing a feature, that you add/update any tests involved.
