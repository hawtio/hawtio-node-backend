/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/express.d.ts" />
/// <reference path="../d.ts/form-data.d.ts" />
/// <reference path="../d.ts/request.d.ts" />
/// <reference path="../d.ts/logger.d.ts" />
/// <reference path="../d.ts/underscore.string.d.ts" />
/// <reference path="../d.ts/URI.d.ts"/>

var express = require('express');
var request = require('request');
var logger:Logging.LoggerStatic = require('js-logger');
var s = require('underscore.string');
var uri = require('URIjs');

logger.useDefaults(logger.DEBUG);
//logger.useDefaults(logger.INFO);

var runningAsScript = require.main === module;

if (runningAsScript) {
  logger.get('hawtio-backend').info("Running as script");
}

