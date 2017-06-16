declare var path: any;
declare var fs: any;
declare var eventStream: any;
declare var express: any;
declare var request: any;
declare var httpProxy: any;
declare var logger: any;
declare var s: any;
declare var _: any;
declare var uri: any;
declare var tiny_lr: any;
declare var liveReload: any;
declare var body: any;
declare var runningAsScript: boolean;
declare var configFile: any;
declare var config: {
    port: number;
    logLevel: any;
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
declare module HawtioBackend {
    var log: any;
    var app: any;
    var proxyRoutes: {};
    function getTargetURI(options: any): any;
    function addStartupTask(cb: () => void): void;
    function setConfig(newConfig: any): void;
    function reload(): any;
    function use(path: any, func: any): void;
    function listen(cb: (server: any) => void): any;
    function stop(cb: any): void;
    function getServer(): any;
}
declare module HawtioBackend {
}
declare module HawtioBackend {
    function mountAsset(mount: string, dir: string): void;
}
