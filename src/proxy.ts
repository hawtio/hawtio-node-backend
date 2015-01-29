/// <reference path="init.ts" />

module HawtioBackend {

  // dynamic proxy
  var proxyRouter = express.Router();

  proxyRouter.param('proto', (req, res, next, proto) => {
    log.debug("requesting proto: ", proto);
    switch (proto.toLowerCase()) {
      case 'http':
      case 'https':
        next();
        break;
      default:
        res.status(406).send('Invalid protocol: "' + proto + '"');
    }
  });

  proxyRouter.param('hostname', (req, res, next, hostname) => {
    log.debug("requesting hostname: ", hostname);
    next();
  });

  proxyRouter.param('port', (req, res, next, port) => {
    log.debug("requesting port: ", port);
    var portNumber = s.toNumber(port);
    log.debug("parsed port number: ", portNumber);
    if (isNaN(portNumber)) {
      res.status(406).send('Invalid port number: "' + port + '"');
    } else {
      next();
    }
  });

  proxyRouter.use('/:proto/:hostname/:port/', (req, res, next) => {
    log.debug("Request path: ", req.path);
    log.debug("Request params: ", req.params);
    log.debug("Request query: ", req.query);

    var target = new uri({
      protocol: req.params.proto,
      hostname: req.params.hostname,
      port: req.params.port,
      path: req.path,
    });
    target.query(req.query);
    var targetURI = target.toString();
    log.debug("Target URI: ", targetURI);
    var r = null;

    switch (req.method) {
      case 'POST':
        r = request.post({uri: targetURI, json: req.body});
        break;
      case 'PUT':
        r = request.put({uri: targetURI, json: req.body });
        break;
      default:
        r = request(targetURI);
        break;
    }

    req.pipe(r).pipe(res);
  });

  addStartupTask(() => {
    log.debug("Setting proxy to route: ", config.proxy);
    app.use(config.proxy, proxyRouter);
  });

}
