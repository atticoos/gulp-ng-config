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
```javascript
gulp.task('test', function () {
  gulp.src('configFile.json')
  .pipe(gulpNgConfig('myApp.config'))
  .pipe(gulp.dest('.'))
});
```
Where `configFile.json` contains:
```json
{
  "string": "my string",
  "integer": 12345,
  "object": {"one": 2, "three": ["four"]},
  "array": ["one", 2, {"three": "four"}, [5, "six"]]
}
```
And then generates `configFile.js` with the following output:

```js
angular.module('myApp.config', [])
.constant('string', "my string")
.constant('integer', 12345)
.constant('object', {"one":2,"three":["four"]})
.constant('array', ["one",2,{"three":"four"},[5,"six"]]);
```
<br/>


## Configuration
Currently there are two configurable options for this plugin:
```javascript
gulpNgConfig('moduleName', {
  constants: object,
  createModule: boolean,
  wrap: boolean | string
});
```

### options.constants
Type: `Object` Optional

You can also override properties from your json file or add more by including them in the gulp tasks:
```javascript
gulp.task('test', function () {
  gulp.src('configFile.json')
  .pipe(gulpNgConfig('myApp.config', {
    constants: {
      string: 'overridden',
      random: 'value'
    }
  }))
  .pipe(gulp.dest('.'))
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

### options.createModule
Type: `Boolean` Default value: `true` Optional

By default, a new module is created with the name supplied. You can access an existing module, rather than creating one, by setting `createModule` to false.
```javascript
gulp.task('test', function () {
  gulp.src('configFile.json')
  .pipe(gulpNgConfig('myApp.config', {
    createModule: false
  }))
  .pipe(gulp.dest('.'))
});
```

This will produce `configFile.js` with an existing angular module
```javascript
angular.module('myApp.config')
.constant('..', '..');
```

### options.wrap
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
  return angular.module('myApp.config')
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
