import { EcosystemAppsMenu } from './EcosystemAppsMenu';
import { CatalogHeroActionsMenu } from './CatalogHeroActionsMenu';
import CatalogGlobalBarTray from './CatalogGlobalBarTray';
import { useCatalogShell } from './context';

export function CatalogHeroTopRow() {
  const shell = useCatalogShell();

  return (
    <div className="catalogHeroTopRow">
      <div className="catalogHeroChromeStart">
        <EcosystemAppsMenu />
        <CatalogHeroActionsMenu variant="globalBar" />
      </div>
      {shell?.heroBannerText ? (
        <p className="catalogHeroBanner catalogHeroBanner--inline">{shell.heroBannerText}</p>
      ) : null}
      <div className="catalogHeroChromeEnd">
        <CatalogGlobalBarTray />
      </div>
    </div>
  );
}
