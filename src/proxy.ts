/// <reference path="init.ts" />

module HawtioBackend {

  function proxy(uri, req, res) {
    function handleError(e) {
      res.status(500).end('error proxying to "' + uri + '": ' + e);
    }
    var r = request({method: req.method, uri: uri, json: req.body});
    req.on('error', handleError)
      .pipe(r)
      .on('error', handleError)
      .pipe(res)
      .on('error', handleError);
  }

  function getTargetURI(options) {
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

  addStartupTask(() => {
    var index = 0;
    config.staticProxies.forEach((proxyConfig:any) => {
      index = index + 1;
      _.defaults(proxyConfig, {
        path: '/proxy-' + index,
        hostname: 'localhost',
        port: 80,
        proto: 'http',
        targetPath: '/proxy-' + index
      });
      log.debug("adding static proxy config: \n", proxyConfig);
      var router = express.Router();
      router.use('/', (req, res, next) => {
        var path = [s.rtrim(proxyConfig.targetPath, '/'), s.ltrim(req.path, '/')].join('/');
        var uri = getTargetURI({
          proto: proxyConfig.proto,
          hostname: proxyConfig.hostname,
          port: proxyConfig.port,
          path: path,
          query: req.query
        });
        proxy(uri, req, res);
      });

      app.use(proxyConfig.path, router);

    });
  });

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
    var uri = getTargetURI({
      proto: req.params.proto,
      hostname: req.params.hostname,
      port: req.params.port,
      path: req.path,
      query: req.query
    });
    proxy(uri, req, res);
  });

  addStartupTask(() => {
    log.debug("Setting dynamic proxy mount point: ", config.proxy);
    app.use(config.proxy, proxyRouter);
  });

}
