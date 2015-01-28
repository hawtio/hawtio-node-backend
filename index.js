/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/express.d.ts" />
/// <reference path="../d.ts/form-data.d.ts" />
/// <reference path="../d.ts/request.d.ts" />
/// <reference path="../d.ts/logger.d.ts" />
/// <reference path="../d.ts/underscore.string.d.ts" />
/// <reference path="../d.ts/URI.d.ts"/>
var express = require('express');
var request = require('request');
var logger = require('js-logger');
var s = require('underscore.string');
var uri = require('URIjs');
logger.useDefaults(logger.DEBUG);
//logger.useDefaults(logger.INFO);
var runningAsScript = require.main === module;
if (runningAsScript) {
    logger.get('hawtio-backend').info("Running as script");
}

/// <reference path="includes.ts" />
var HawtioBackend;
(function (HawtioBackend) {
    HawtioBackend.log = logger.get('hawtio-backend');
    HawtioBackend.app = express();
    function setLogLevel(level) {
        logger.setLevel(level);
    }
    HawtioBackend.setLogLevel = setLogLevel;
    var server = null;
    function listen(port, cb) {
        server = HawtioBackend.app.listen(port, function () {
            cb(server);
        });
        return server;
    }
    HawtioBackend.listen = listen;
    function getServer() {
        return server;
    }
    HawtioBackend.getServer = getServer;
    if (runningAsScript) {
        server = listen(2772, function (server) {
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
    HawtioBackend.app.use('/proxy', proxyRouter);
})(HawtioBackend || (HawtioBackend = {}));
