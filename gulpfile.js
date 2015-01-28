var gulp = require('gulp'),
    eventStream = require('event-stream'),
    map = require('vinyl-map'),
    path = require('path'),
    fs = require('fs'),
    s = require('underscore.string'),
    gulpLoadPlugins = require('gulp-load-plugins');

var plugins = gulpLoadPlugins({});
var pkg = require('./package.json');

var config = {
  main: pkg.main,
  ts: ['src/*.ts', 'src/**/*.ts'],
  dts: ['d.ts/*.d.ts', 'd.ts/**/*.d.ts'],
  tsProject: plugins.typescript.createProject({
    target: 'ES5',
    module: 'commonjs',
    declarationFiles: true,
    noExternalResolve: false
  })
};

gulp.task('clean-defs', function() {
  return gulp.src('defs.d.ts', { read: false })
    .pipe(plugins.clean());
});

gulp.task('tsc', ['clean-defs'], function() {
  var cwd = process.cwd();
  var tsResult = gulp.src(config.ts)
    .pipe(plugins.typescript(config.tsProject))
    .on('error', plugins.notify.onError({
      message: '#{ error.message }',
      title: 'Typescript compilation error'
    }));

    return eventStream.merge(
      tsResult.js
        .pipe(plugins.concat(config.main))
        .pipe(gulp.dest('.')),
      tsResult.dts
        .pipe(gulp.dest('d.ts')))
        .pipe(map(function(buf, filename) {
          if (!s.endsWith(filename, 'd.ts')) {
            return buf;
          }
          var relative = path.relative(cwd, filename);
          fs.appendFileSync('defs.d.ts', '/// <reference path="' + relative + '"/>\n');
          return buf;
        }));
});

gulp.task('watch', ['build'], function() {
  plugins.watch(config.ts, function() {
    gulp.start(['tsc']);
  });
  /*
  plugins.watch(config.dts, function() {
    gulp.start(['tsc']);
  });
  */
});

gulp.task('build', ['tsc']);

gulp.task('default', ['watch']);
