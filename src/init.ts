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
  
  export function setLogLevel(level:Logging.LogLevel) {
    logger.setLevel(level);
  }

  var server = null;
  var lrServer = null;

  export function listen(cb:(server:any) => void) {
    if (config.liveReload.enabled) {
      var port = config.liveReload.port || 35729;
      lrServer = lr().listen(port, () => {
        log.info("Started livereload, port :", port);
      });
    }
    listening = true;
    startupTasks.forEach((cb) => {
      log.debug("Executing startup task");
      cb();
    });
    server = app.listen(config.port, () => {
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
  
