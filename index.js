/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/express.d.ts" />
/// <reference path="../d.ts/form-data.d.ts" />
/// <reference path="../d.ts/request.d.ts" />
/// <reference path="../d.ts/logger.d.ts" />
/// <reference path="../d.ts/lodash.d.ts" />
/// <reference path="../d.ts/underscore.string.d.ts" />
/// <reference path="../d.ts/URI.d.ts"/>
var fs = require('fs');
var express = require('express');
var request = require('request');
var logger = require('js-logger');
var s = require('underscore.string');
var _ = require('lodash');
var uri = require('URIjs');
var runningAsScript = require.main === module;
var configFile = process.env.HAWTIO_CONFIG_FILE || 'config.js';
// default config values
var config = {
    // server listen port
    port: 2772,
    // log level
    logLevel: logger.DEBUG,
    // path to mount the dyamic proxy
    proxy: '/proxy',
    // paths to connect to external services
    staticProxies: [],
    // directories to search for static assets
    staticAssets: [
        '/assets'
    ]
};
if (fs.existsSync(configFile)) {
    config = require(configFile);
}
logger.useDefaults(config.logLevel);
if (runningAsScript) {
    logger.get('hawtio-backend').info("Running as script");
}

/// <reference path="includes.ts" />
var HawtioBackend;
(function (HawtioBackend) {
    HawtioBackend.log = logger.get('hawtio-backend');
    HawtioBackend.app = express();
    var startupTasks = [];
    var listening = false;
    function addStartupTask(cb) {
        HawtioBackend.log.debug("Adding startup task");
        startupTasks.push(cb);
        if (listening) {
            cb();
        }
    }
    HawtioBackend.addStartupTask = addStartupTask;
    function setConfig(newConfig) {
        _.assign(config, newConfig);
    }
    HawtioBackend.setConfig = setConfig;
    function setLogLevel(level) {
        logger.setLevel(level);
    }
    HawtioBackend.setLogLevel = setLogLevel;
    var server = null;
    function listen(port, cb) {
        listening = true;
        startupTasks.forEach(function (cb) {
            HawtioBackend.log.debug("Executing startup task");
            cb();
        });
        server = HawtioBackend.app.listen(port, function () {
            cb(server);
        });
        return server;
    }
    HawtioBackend.listen = listen;
    function stop(cb) {
        if (server) {
            server.close(function () {
                listening = false;
                if (cb) {
                    cb();
                }
            });
        }
    }
    HawtioBackend.stop = stop;
    function getServer() {
        return server;
    }
    HawtioBackend.getServer = getServer;
    if (runningAsScript) {
        server = listen(config.port, function (server) {
            var host = server.address().address;
            var port = server.address().port;
            HawtioBackend.log.info("started at ", host, ":", port);
        });
    }
})(HawtioBackend || (HawtioBackend = {}));
(module).exports = HawtioBackend;

/// <reference path="init.ts" />
var HawtioBackend;
(function (HawtioBackend) {
    // dynamic proxy
    var proxyRouter = express.Router();
    proxyRouter.param('proto', function (req, res, next, proto) {
        HawtioBackend.log.debug("requesting proto: ", proto);
        switch (proto.toLowerCase()) {
            case 'http':
            case 'https':
                next();
                break;
            default:
                res.status(406).send('Invalid protocol: "' + proto + '"');
        }
    });
    proxyRouter.param('hostname', function (req, res, next, hostname) {
        HawtioBackend.log.debug("requesting hostname: ", hostname);
        next();
    });
    proxyRouter.param('port', function (req, res, next, port) {
        HawtioBackend.log.debug("requesting port: ", port);
        var portNumber = s.toNumber(port);
        HawtioBackend.log.debug("parsed port number: ", portNumber);
        if (isNaN(portNumber)) {
            res.status(406).send('Invalid port number: "' + port + '"');
        }
        else {
            next();
        }
    });
    proxyRouter.use('/:proto/:hostname/:port/', function (req, res, next) {
        HawtioBackend.log.debug("Request path: ", req.path);
        HawtioBackend.log.debug("Request params: ", req.params);
        HawtioBackend.log.debug("Request query: ", req.query);
        var target = new uri({
            protocol: req.params.proto,
            hostname: req.params.hostname,
            port: req.params.port,
            path: req.path,
        });
        target.query(req.query);
        var targetURI = target.toString();
        HawtioBackend.log.debug("Target URI: ", targetURI);
        var r = null;
        switch (req.method) {
            case 'POST':
                r = request.post({ uri: targetURI, json: req.body });
                break;
            case 'PUT':
                r = request.put({ uri: targetURI, json: req.body });
                break;
            default:
                r = request(targetURI);
                break;
        }
        req.pipe(r).pipe(res);
    });
    HawtioBackend.addStartupTask(function () {
        HawtioBackend.log.debug("Setting proxy to route: ", config.proxy);
        HawtioBackend.app.use(config.proxy, proxyRouter);
    });
})(HawtioBackend || (HawtioBackend = {}));

/// <reference path="init.ts"/>
var HawtioBackend;
(function (HawtioBackend) {
    function mountAsset(mount, dir) {
        HawtioBackend.app.get(mount, express.static(__dirname + dir));
    }
    HawtioBackend.mountAsset = mountAsset;
    HawtioBackend.addStartupTask(function () {
        config.staticAssets.forEach(function (asset) {
            HawtioBackend.log.info("Mounting static asset: ", asset);
            mountAsset('/', asset);
        });
    });
})(HawtioBackend || (HawtioBackend = {}));
