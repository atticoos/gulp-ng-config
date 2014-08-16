#gulp-ng-config
It's often useful to generate a file of constants, usually as environment variables, for your Angular apps.
This Gulp plugin will allow you to provide an object of properties and will generate an Angular module of constants.

### How it works
It's pretty simple:
`gulpNgConfig(moduleName)`


### Example Usage
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
And then generates `config.js` with the following output:

```html
angular.module('MyModule')
.constant('string', "my string")
.constant('integer', 12345)
.constant('object', {"one":2,"three":["four"]})
.constant('array', ["one",2,{"three":"four"},[5,"six"]]);
```

### Roadmap
- tests
