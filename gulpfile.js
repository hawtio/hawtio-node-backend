const { src, dest, watch, series } = require('gulp');
const del = require('del');
const ts = require('gulp-typescript');
const tsProject = ts.createProject('tsconfig.json');
const tsConfig = require('./tsconfig.json');

function clean() {
  return del('index.js');
}

function tsc() {
  return tsProject.src()
    .pipe(tsProject())
    .pipe(dest('.'));
}

function server(cb) {
  const hawtioBackend = require('./index.js');
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
    const host = server.address().address;
    const port = server.address().port;
    console.log("started from gulp file at ", host, ":", port);
    cb();
  });
}

function watcher() {
  return watch([...tsConfig.include, 'assets/*'], () => src('.').pipe(hawtioBackend.reload()));
}

exports.build = series(clean, tsc);
exports.default = series(clean, tsc, server, watcher);
