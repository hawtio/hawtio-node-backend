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
