/// <reference path="includes.ts" />

module HawtioBackend {
  export var log = logger.get('hawtio-backend');
  export var app = express();

  export function setLogLevel(level:Logging.LogLevel) {
    logger.setLevel(level);
  }

  var server = null;

  export function listen(port:number, cb:(server:any) => void) {
    server = app.listen(port, () => {
      cb(server); 
    });
    return server;
  }

  export function getServer() {
    return server;
  }

  if (runningAsScript) {
    server = listen(2772, (server) => {
      var host = server.address().address;
      var port = server.address().port;
      log.info("started at ", host, ":", port);
    });
  }

}

(module).exports = HawtioBackend;
  
