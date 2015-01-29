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

  export function listen(port:number, cb:(server:any) => void) {
    listening = true;
    startupTasks.forEach((cb) => {
      log.debug("Executing startup task");
      cb();
    });
    server = app.listen(port, () => {
      cb(server); 
    });
    return server;
  }

  export function stop(cb) {
    if (server) {
      server.close(() => {
        listening = false;
        if (cb) {
          cb();
        }
      });
    }
  }

  export function getServer() {
    return server;
  }

  if (runningAsScript) {
    server = listen(config.port, (server) => {
      var host = server.address().address;
      var port = server.address().port;
      log.info("started at ", host, ":", port);
    });
  }

}

(module).exports = HawtioBackend;
  
