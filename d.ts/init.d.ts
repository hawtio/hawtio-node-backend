/// <reference path="includes.d.ts" />
declare module HawtioBackend {
    var log: Logging.Logger;
    var app: any;
    function setLogLevel(level: Logging.LogLevel): void;
    function listen(port: number, cb: (server: any) => void): any;
    function getServer(): any;
}
