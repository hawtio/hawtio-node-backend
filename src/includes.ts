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
var logger:Logging.LoggerStatic = require('js-logger');
var s = require('underscore.string');
var _:_.LoDashStatic = require('lodash');
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
}
if (fs.existsSync(configFile)) {
  config = require(configFile);
}

logger.useDefaults(config.logLevel);

if (runningAsScript) {
  logger.get('hawtio-backend').info("Running as script");
}

