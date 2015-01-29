## hawtio-node-backend

A simple node backend for hawtio 2.x that can either be run from a gulpfile or as an independent server.  The server can serve out static assets, has a dynamic proxy and also supports configuring static proxies to backend services.

### Configuration

The backend can be configured either via a config.js file:

```
// default config values
var config = {
  // server listen port
  port: 2772,
  // log level
  logLevel: logger.DEBUG,
  // path to mount the dyamic proxy
  proxy: '/proxy',
  // paths to connect to external services, an example config:
  // {
  //   proto: 'http',
  //   hostname: 'localhost',
  //   port: 8282,
  //   path: '/hawtio/jolokia',
  //   targetPath: '/hawtio/jolokia'
  // }
  //
  staticProxies: [],
  // directories to search for static assets
  staticAssets: [
    '/assets'
  ],
  liveReload: {
    enabled: false,
    port: 35729
  }
}
module.exports = config;
```

Or if using from a gulp file you can do:

```
var HawtioBackend = require('hawtio-node-backend');
HawtioBackend.setConfig({
  port: 2332,
  staticProxies: [{
    port: 8282,
    path: '/jolokia',
    targetPath: '/hawtio/jolokia'
  }],
  assets: ['.'],
  liveReload: {
    enabled: true
  }
});
```

### Full live reload gulpfile set up

It's very similar to gulp-connect:

```
var HawtioBackend = require('hawtio-node-backend');

gulp.task('watch', function() {
  plugins.watch(['assets/*'], function() {
    gulp.start(['reload']);
  });
});

gulp.task('reload', function() {
  gulp.src('.')
    .pipe(HawtioBackend.reload());
});

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

```
