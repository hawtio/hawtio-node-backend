/// <reference path="../d.ts/node.d.ts" />
/// <reference path="../d.ts/express.d.ts" />
/// <reference path="../d.ts/form-data.d.ts" />
/// <reference path="../d.ts/request.d.ts" />
/// <reference path="../d.ts/logger.d.ts" />
/// <reference path="../d.ts/lodash.d.ts" />
/// <reference path="../d.ts/underscore.string.d.ts" />
/// <reference path="../d.ts/URI.d.ts" />
declare var path: any;
declare var fs: any;
declare var eventStream: any;
declare var express: any;
declare var request: any;
declare var logger: Logging.LoggerStatic;
declare var s: any;
declare var _: _.LoDashStatic;
declare var uri: any;
declare var tiny_lr: any;
declare var liveReload: any;
declare var body: any;
declare var runningAsScript: boolean;
declare var configFile: any;
declare var config: {
    port: number;
    logLevel: Logging.LogLevel;
    proxy: string;
    staticProxies: any[];
    staticAssets: {
        path: string;
        dir: string;
    }[];
    fallback: any;
    liveReload: {
        enabled: boolean;
        port: number;
    };
};
