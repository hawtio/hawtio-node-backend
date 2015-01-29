/// <reference path="includes.ts" />

module HawtioBackend {
  export var log = logger.get('hawtio-backend');
  export var app = express();

  var startupTasks = [];
  var listening = false;

  export function addStartupTask(cb:() => void) {
    log.debug("Adding startup task");
    startupTasks.push(cb);
    if (listening) {
      cb();
    }
  }

  export function setConfig(newConfig:any) {
    _.assign(config, newConfig);
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
  
