import { useRef, useState } from 'react';
import { GridViewIcon, LotusLogoIcon, RocketIcon, WaterIcon, CompassIcon } from '../icons';
import { ECOSYSTEM_APPS } from '../data/ecosystemApps';
import { Modal } from '../components/ui/Modal';
import { AnchoredPortalPanel } from './AnchoredPortalPanel';

function PopOutIcon() {
  return (
    <svg className="ecosystemAppsPopOutIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path d="M18 13v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function iconForApp(iconKey) {
  switch (iconKey) {
    case 'catalog':
      return <LotusLogoIcon />;
    case 'app4':
      return <RocketIcon />;
    case 'app5':
      return <WaterIcon />;
    case 'app7':
      return <CompassIcon />;
    default:
      return <GridViewIcon />;
  }
}

function navigateToApp(app) {
  if (!app?.href) return;
  if (app.sameWindow) {
    window.location.assign(app.href);
  } else {
    window.open(app.href, '_blank', 'noopener,noreferrer');
  }
}

export function EcosystemAppsMenu() {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="ecosystemAppsWrap">
      <button
        ref={btnRef}
        type="button"
        className="catalogHeroIconBtn"
        aria-label="More apps"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((o) => !o)}
      >
        <GridViewIcon />
      </button>

      <AnchoredPortalPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        className="ecosystemAppsMenu ecosystemAppsMenu--portal"
      >
        <div className="ecosystemAppsMenuHeader">
          <h2 className="ecosystemAppsMenuTitle">More apps</h2>
        </div>
        <div className="ecosystemAppsMenuScroll" role="menu">
          {ECOSYSTEM_APPS.map((app) => (
            <button
              key={app.id}
              type="button"
              role="menuitem"
              className={`ecosystemAppsItem ecosystemAppsItem--${app.id}`}
              onClick={() => {
                setOpen(false);
                navigateToApp(app);
              }}
            >
              <span className="ecosystemAppsItemIcon">{iconForApp(app.icon)}</span>
              <span className="ecosystemAppsItemText">
                <span className="ecosystemAppsItemName">{app.name}</span>
                <span className="ecosystemAppsItemDesc">{app.description}</span>
              </span>
            </button>
          ))}
        </div>
        <div className="ecosystemAppsMenuFooter">
          <button
            type="button"
            className="ecosystemAppsPopOutBtn"
            aria-label="Open apps grid"
            title="Open apps grid"
            onClick={() => {
              setOpen(false);
              setModalOpen(true);
            }}
          >
            <PopOutIcon />
          </button>
        </div>
      </AnchoredPortalPanel>

      {modalOpen && (
        <Modal
          titleId="ecosystem-apps-modal-title"
          title="More apps"
          onClose={() => setModalOpen(false)}
          size="lg"
          className="ecosystemAppsModalPanel"
          bodyClassName="ecosystemAppsModalBody"
        >
          <div className="ecosystemAppsModalGrid">
            {ECOSYSTEM_APPS.map((app) => (
              <button
                key={app.id}
                type="button"
                className="ecosystemAppsModalCard"
                onClick={() => {
                  setModalOpen(false);
                  navigateToApp(app);
                }}
              >
                <span className={`ecosystemAppsModalCardIcon ecosystemAppsModalCardIcon--${app.id}`}>{iconForApp(app.icon)}</span>
                <span className="ecosystemAppsModalCardText">
                  <span className="ecosystemAppsModalCardName">{app.name}</span>
                  <span className="ecosystemAppsModalCardDesc">{app.description}</span>
                </span>
              </button>
            ))}
          </div>
        </Modal>
      )}
    </div>
  );
}
