var del = require('del');
var gulp = require('gulp');
var ts = require('gulp-typescript');
var tsProject = ts.createProject('tsconfig.json');
var tsConfig = require('./tsconfig.json');
var hawtioBackend = null;

gulp.task('clean', function() {
  return del('index.js');
});

gulp.task('tsc', ['clean'], function() {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(gulp.dest('.'));
});

gulp.task('watch', function() {
  return gulp.watch([tsConfig.include, 'assets/*'], ['reload']);
});

gulp.task('reload', function() {
  return gulp.src('.')
    .pipe(hawtioBackend.reload());
});

// Test out the server in a gulpfile
gulp.task('server', ['tsc'], function() {
  hawtioBackend = require('./index.js');
  hawtioBackend.setConfig({
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
  hawtioBackend.listen(function(server) {
    var host = server.address().address;
    var port = server.address().port;
    console.log("started from gulp file at ", host, ":", port);
  });
});

gulp.task('build', ['tsc']);

gulp.task('default', ['build', 'server', 'watch']);
