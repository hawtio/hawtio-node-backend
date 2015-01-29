/// <reference path="includes.d.ts" />
declare module HawtioBackend {
    var log: Logging.Logger;
    var app: any;
    function addStartupTask(cb: () => void): void;
    function setConfig(newConfig: any): void;
    function reload(): any;
    function listen(cb: (server: any) => void): any;
    function stop(cb: any): void;
    function getServer(): any;
}
