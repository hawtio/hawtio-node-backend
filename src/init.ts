/// <reference path="includes.ts" />

module HawtioBackend {
  export var log = logger.get('hawtio-backend');
  export var app = express();
  export var proxyRoutes = {};

  var startupTasks = [];
  var listening = false;

  export function getTargetURI(options) {
    var target = new uri({
      protocol: options.proto,
      hostname: options.hostname,
      port: options.port,
      path: options.path
    });
    target.query(options.query);
    var targetURI = target.toString();
    log.debug("Target URI: ", targetURI);
    return targetURI;
  }

  export function addStartupTask(cb:() => void) {
    log.debug("Adding startup task");
    startupTasks.push(cb);
    if (listening) {
      cb();
    }
  }

  export function setConfig(newConfig:any) {
    _.assign(config, newConfig);
    log.setLevel(config.logLevel);
  }
  
  var server = null;
  var lr = null;
  var lrServer = null;

  export function reload() {
    return eventStream.map((file, callback) => {
      if (lr) {
        lr.changed({
          body: {
            files: file.path
          }
        });
      }
      return callback(null, file);
    });
  } 

  export function use(path: any, func: any) {
    app.use(path, func);
  }

  export function listen(cb:(server:any) => void) {
    var lrPort = config.liveReload.port || 35729;
    if (config.liveReload.enabled) {
      app.use(liveReload({ port: lrPort }));
    }
    listening = true;
    startupTasks.forEach((cb) => {
      log.debug("Executing startup task");
      cb();
    });
    if (config.fallback) {
      app.use((req, res, next) => {
        fs.createReadStream(config.fallback).pipe(res);
      });
    } 
    server = app.listen(config.port, () => {
      if (config.liveReload.enabled) {
        lr = tiny_lr();
        lrServer = lr.listen(lrPort, () => {
          log.info("Started livereload, port :", lrPort);
        });
      }
      cb(server); 
    });
    server.on('upgrade', (req, socket, head) => {
      //console.log("Upgrade event for URL: ", req.url);
      var targetUri = new uri(req.url);
      var targetPath = targetUri.path();
      _.forIn(proxyRoutes, (config:any, route) => {
        if (s.startsWith(targetPath, route)) {
          //console.log("Found config for route: ", route, " config: ", config);
          if (!config.httpProxy) {
              var proxyConfig = config.proxyConfig;
              var target = new uri().protocol(proxyConfig.proto).host(proxyConfig.hostname).port(proxyConfig.port).path(proxyConfig.targetPath).query({}).toString();
              console.log("Creating websocket proxy to target: ", target);
              config.proxy = httpProxy.createProxyServer({
                  target: target,
                  secure: false,
                  ws: true
              });
          }
          targetPath = targetPath.substring(route.length);
          req.url = targetUri.path(targetPath).toString();
          config.proxy.ws(req, socket, head);
        }
      });
    });
    return server;
  }

  export function stop(cb) {
    if (lrServer) {
      lrServer.close(() => {
        log.info("Stopped livereload port");
      });
      lrServer = null;
    } 
    if (server) {
      server.close(() => {
        listening = false;
        if (cb) {
          cb();
        }
      });
      server = null;
    }
  }

  export function getServer() {
    return server;
  }

  if (runningAsScript) {
    server = listen((server) => {
      var host = server.address().address;
      var port = server.address().port;
      log.info("started at ", host, ":", port);
    });
  }

}

(module).exports = HawtioBackend;
  
