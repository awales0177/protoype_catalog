import { DarkModeIcon, LightModeIcon } from '../icons';
import { useCatalogShell } from './context';
import { HeaderFeedbackModal } from './HeaderFeedbackModal';
import { HeaderNotificationsMenu } from './HeaderNotificationsMenu';
import { HeaderProfileMenu } from './HeaderProfileMenu';

/**
 * Right-side header controls aligned with `CatalogHeroTopRow` (home):
 * feedback, notifications, theme, profile.
 */
export default function CatalogGlobalBarTray({ className = '' }) {
  const shell = useCatalogShell();
  const darkMode = !!shell?.darkMode;
  const toggleDarkMode = shell?.toggleDarkMode ?? (() => {});

  const trayClass = ['catalogHeroChromeEnd', className].filter(Boolean).join(' ');

  return (
    <div className={trayClass}>
      <HeaderFeedbackModal
        submitFeedback={shell?.submitFeedback}
        feedbackSubtitle={shell?.feedbackSubtitle}
        resolveUserId={shell?.resolveUserId}
      />
      <HeaderNotificationsMenu />
      <button
        type="button"
        className="catalogHeroIconBtn"
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        title={darkMode ? 'Light mode' : 'Dark mode'}
        onClick={toggleDarkMode}
      >
        {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
      </button>
      <HeaderProfileMenu />
    </div>
  );
}
