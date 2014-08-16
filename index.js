var through = require('through');

module.exports = function (filename) {

  function bufferContents (file) {
    if (file.isNull()) return;
    if (file.isStream()) return new PluginError('gulp-ng-config', 'Streaming not suported');

  }

  function endStream () {

  }

  return through(bufferContents, endStream);
};
