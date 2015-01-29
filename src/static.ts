/// <reference path="init.ts"/>

module HawtioBackend {

  export function mountAsset(mount:string, dir:string) {
    app.use(mount, express.static(path.normalize(dir)));
  }

  addStartupTask(() => {
    config.staticAssets.forEach((asset) => {
      log.info("Mounting static asset: ", asset);
      mountAsset(asset.path, asset.dir);
    });
  });

}
