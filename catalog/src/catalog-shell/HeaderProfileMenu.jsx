import { useRef, useState } from 'react';
import {
  PersonOutlineIcon,
  GlobeIcon,
  GridIcon,
  ChevronDownIcon,
} from '../icons';
import { useCatalogShell } from './context';
import { AnchoredPortalPanel } from './AnchoredPortalPanel';

export function HeaderProfileMenu() {
  const shell = useCatalogShell();
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState('personal');
  const displayName = shell?.defaultProfileDisplayName || 'Profile';

  const nav = [
    { key: 'subs', label: 'Manage subscriptions', onClick: shell?.onProfileManageSubscriptions },
    { key: 'prefs', label: 'Update preferences', onClick: shell?.onProfileUpdatePreferences },
    { key: 'xfer', label: 'Track my transfers', onClick: shell?.onProfileTrackTransfers },
    { key: 'other', label: 'Other profile option', onClick: shell?.onProfileOther },
  ];

  return (
    <div className="headerProfileWrap">
      <button
        ref={btnRef}
        type="button"
        className="catalogHeroIconBtn catalogHeroIconBtn--profile"
        aria-label="My profile"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <PersonOutlineIcon />
      </button>
      <AnchoredPortalPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        className="headerProfilePanel headerProfilePanel--portal"
      >
        <div className="headerProfilePanelHeader">
          <h2 className="headerProfilePanelTitle">My profile</h2>
          <span className="headerProfileHeaderGlyph" aria-hidden>
            <PersonOutlineIcon />
          </span>
        </div>
        <label htmlFor="header-profile-display" className="headerProfileFieldLabel">
          Display name (hint text)
        </label>
        <p className="headerProfileHint">This name appears in comments, subscriptions, and notifications.</p>
        <input id="header-profile-display" className="headerProfileInput" type="text" readOnly value={displayName} />

        <span className="headerProfileViewModeLabel">View mode</span>
        <div className="headerProfileViewMode" role="group" aria-label="View mode">
          <button
            type="button"
            className="headerProfileViewModeBtn"
            aria-pressed={viewMode === 'personal'}
            onClick={() => setViewMode('personal')}
          >
            <GlobeIcon /> Personal
          </button>
          <button
            type="button"
            className="headerProfileViewModeBtn"
            aria-pressed={viewMode === 'organization'}
            onClick={() => setViewMode('organization')}
          >
            <GridIcon /> Organization
          </button>
        </div>

        <hr className="headerProfileDivider" />

        <button
          type="button"
          className="headerProfileManageLaunch"
          onClick={() => {
            setOpen(false);
            shell?.onProfileManageExperience?.();
          }}
        >
          <span className="headerProfileManageTitle">Manage my experience</span>
          <span className="headerProfileManageDesc">Subscriptions, preferences, transfers, and more in one place.</span>
        </button>

        <nav className="headerProfileNav" aria-label="Profile shortcuts">
          {nav.map((item) => (
            <button
              key={item.key}
              type="button"
              className="headerProfileNavBtn"
              onClick={() => {
                setOpen(false);
                item.onClick?.();
              }}
            >
              {item.label}
              <span className="headerProfileNavBtnChevron" aria-hidden style={{ display: 'inline-flex', transform: 'rotate(-90deg)' }}>
                <ChevronDownIcon />
              </span>
            </button>
          ))}
        </nav>
      </AnchoredPortalPanel>
    </div>
  );
}
