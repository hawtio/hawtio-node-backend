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


// testing out stuff
var HawtioBackend = require('./index.js');

gulp.task('testWatch', function() {
  plugins.watch(['assets/*'], function() {
    gulp.start(['reload']);
  });
});

gulp.task('reload', function() {
  gulp.src('.')
    .pipe(HawtioBackend.reload());
});

// Test out the server in a gulpfile
gulp.task('server', function() {
  HawtioBackend.setConfig({
    logLevel: require('js-logger').DEBUG,
    port: 8080,
    staticProxies: [{
      port: 8282,
      path: '/hawtio/jolokia',
      targetPath: '/hawtio/jolokia'
    }],
    liveReload: {
      enabled: true
    }
  });
  HawtioBackend.listen(function(server) {
    var host = server.address().address;
    var port = server.address().port;
    console.log("started from gulp file at ", host, ":", port);
  });
});

gulp.task('build', ['tsc']);

gulp.task('default', ['watch']);
