import { useRef, useState } from 'react';
import { NotificationsOutlinedIcon } from '../icons';
import { useCatalogShell } from './context';
import { AnchoredPortalPanel } from './AnchoredPortalPanel';

const PLACEHOLDER_NOTIFICATIONS = [
  {
    id: 'n1',
    title: 'Subscription update',
    description: 'You are now following changes for one dataset.',
    time: '2h',
  },
  {
    id: 'n2',
    title: 'Policy reminder',
    description: 'Review updated data retention guidelines.',
    time: '1d',
  },
];

export function HeaderNotificationsMenu() {
  const shell = useCatalogShell();
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const count = Number(shell?.notificationCount ?? 0);

  return (
    <div className="headerNotifWrap">
      <button
        ref={btnRef}
        type="button"
        className="catalogHeroIconBtn catalogHeroIconBtn--notif"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <NotificationsOutlinedIcon />
        {count > 0 ? <span className="catalogHeroBellBadge">{count > 99 ? '99+' : count}</span> : null}
      </button>
      <AnchoredPortalPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        className="headerNotifPanel headerNotifPanel--portal"
      >
        <div className="headerNotifPanelHeader">
          <h2 className="headerNotifPanelTitle">Notifications</h2>
          <span className="headerNotifHeaderGlyph" aria-hidden>
            <NotificationsOutlinedIcon />
            {count > 0 ? <span className="headerNotifHeaderBadge">{count > 99 ? '99+' : count}</span> : null}
          </span>
        </div>
        <ul className="headerNotifList">
          {PLACEHOLDER_NOTIFICATIONS.map((n) => (
            <li key={n.id}>
              <button type="button" className="headerNotifCard" onClick={() => setOpen(false)}>
                <span className="headerNotifCardIcon" aria-hidden>
                  <NotificationsOutlinedIcon />
                </span>
                <span className="headerNotifCardBody">
                  <h3 className="headerNotifCardTitle">{n.title}</h3>
                  <p className="headerNotifCardDesc">{n.description}</p>
                </span>
                <span className="headerNotifCardTime">{n.time}</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="headerNotifFooter">
          <button
            type="button"
            className="headerNotifViewAll"
            onClick={() => {
              setOpen(false);
              shell?.openNotifications?.();
            }}
          >
            View all
            <span className="headerNotifViewAllChevron" aria-hidden>
              ›
            </span>
          </button>
        </div>
      </AnchoredPortalPanel>
    </div>
  );
}
