/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/express.d.ts" />
/// <reference path="../d.ts/form-data.d.ts" />
/// <reference path="../d.ts/request.d.ts" />
/// <reference path="../d.ts/logger.d.ts" />
/// <reference path="../d.ts/lodash.d.ts" />
/// <reference path="../d.ts/underscore.string.d.ts" />
/// <reference path="../d.ts/URI.d.ts"/>
var path = require('path');
var fs = require('fs');
var eventStream = require('event-stream');
var express = require('express');
var request = require('request');
var logger:Logging.LoggerStatic = require('js-logger');
var s = require('underscore.string');
var _:_.LoDashStatic = require('lodash');
var uri = require('URIjs');
var tiny_lr = require('tiny-lr');
var liveReload = require('connect-livereload');
var body = require('body-parser');
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
    {
      path: '/',
      dir: '.'
    }
  ],
  liveReload: {
    enabled: false,
    port: 35729
  }
}
if (fs.existsSync(configFile)) {
  var conf = require(configFile);
  _.assign(config, conf);
}

logger.useDefaults(config.logLevel);

if (runningAsScript) {
  logger.get('hawtio-backend').info("Running as script");
}

