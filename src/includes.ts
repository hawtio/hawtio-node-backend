var path = require('path');
var fs = require('fs');
var eventStream = require('event-stream');
var express = require('express');
var request = require('request');
var httpProxy = require('http-proxy');
var logger = require('js-logger');
var s = require('underscore.string');
var _ = require('lodash');
var URI = require('urijs');
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
  logLevel: logger.INFO,
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
  fallback: null,
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

