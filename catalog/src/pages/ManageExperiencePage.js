import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CatalogRouteShell from '../components/shell/CatalogRouteShell';
import './ManageExperiencePage.css';

const DISPLAY_NAME_STORAGE_KEY = 'catalog_ds_profile_display_name';

const TABS = [
  { id: 'settings', label: 'Manage Profile Settings' },
  { id: 'subscriptions', label: 'Manage Subscriptions' },
  { id: 'other', label: 'Other Profile Option' },
];

const IAM_OPTIONS = ['data scientist', 'data engineer', 'steward', 'analyst'];
const FOCUS_OPTIONS = ['finance', 'operations', 'marketing', 'research'];
const FOLLOW_OPTIONS = ['finance', 'risk', 'compliance', 'product'];

const INTEREST_GROUPS = [
  { title: 'Topics', rows: [['Customer', 'Orders', 'Inventory'], ['Compliance', 'Privacy', 'Retention'], ['Forecasting', 'Churn', 'LTV']] },
  { title: 'Keywords', rows: [['ETL', 'Lakehouse', 'Contract'], ['Lineage', 'Quality', 'SLA'], ['Serve', 'Batch', 'Streaming']] },
  { title: 'Domains', rows: [['Retail', 'Banking', 'Healthcare']] },
  { title: 'Models', rows: [['Regression', 'Classification'], ['Forecast', 'Embedding']] },
  { title: 'Languages', rows: [['SQL', 'Python'], ['R', 'Scala']] },
];

function readStoredDisplayName() {
  if (typeof window === 'undefined') return 'John Dow';
  try {
    return window.localStorage.getItem(DISPLAY_NAME_STORAGE_KEY) || 'John Dow';
  } catch {
    return 'John Dow';
  }
}

function ManageExperiencePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') || 'settings';
  const activeTab = TABS.some((t) => t.id === tabParam) ? tabParam : 'settings';

  const [displayName, setDisplayName] = useState(readStoredDisplayName);
  const [organization, setOrganization] = useState('prefilled');
  const [iam, setIam] = useState('data scientist');
  const [focused, setFocused] = useState('finance');
  const [following, setFollowing] = useState('finance');

  useEffect(() => {
    setDisplayName(readStoredDisplayName());
  }, []);

  const setTab = (id) => {
    const next = new URLSearchParams(searchParams);
    if (id === 'settings') next.delete('tab');
    else next.set('tab', id);
    setSearchParams(next, { replace: true });
  };

  const persistName = () => {
    const next = displayName.trim();
    setDisplayName(next);
    try {
      window.localStorage.setItem(DISPLAY_NAME_STORAGE_KEY, next);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="manageExpPage">
      <CatalogRouteShell>
      <>
      <header className="manageExpPageHeader">
        <h1 className="manageExpPageTitle">My Profile</h1>
      </header>

      <main className="manageExpMain">
        <div className="manageExpCard">
          <div className="manageExpTabs" role="tablist" aria-label="Profile sections">
            {TABS.map((t) => (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={activeTab === t.id}
                aria-controls={`manage-exp-panel-${t.id}`}
                id={`manage-exp-tab-${t.id}`}
                className={`manageExpTab ${activeTab === t.id ? 'manageExpTab--active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === 'settings' && (
            <section
              className="manageExpPanel"
              id="manage-exp-panel-settings"
              role="tabpanel"
              aria-labelledby="manage-exp-tab-settings"
            >
              <h2 className="manageExpPanelTitle" id="manage-exp-settings-heading">
                My Profile
              </h2>
              <p className="manageExpPanelIntro">
                Your profile settings (job, focus, interests) help us tailor search, recommendations, and notifications across
                the catalog. Update them anytime to reflect how you work with data.
              </p>

              <div className="manageExpField">
                <label className="manageExpLabel" htmlFor="manage-exp-display-name">
                  Display Name
                </label>
                <p className="manageExpHint">
                  This name will display only to you in this web experience. (Keep in mind that, while others won&apos;t see your
                  name this way, it&apos;s still in an enterprise application. It isn&apos;t truly private, so choose wisely!)
                </p>
                <input
                  id="manage-exp-display-name"
                  type="text"
                  className="manageExpInput"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  onBlur={persistName}
                  autoComplete="name"
                />
              </div>

              <div className="manageExpField">
                <label className="manageExpLabel" htmlFor="manage-exp-org">
                  My Current Organization
                </label>
                <input
                  id="manage-exp-org"
                  type="text"
                  className="manageExpInput"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                />
              </div>

              <div className="manageExpSelectRow">
                <div className="manageExpField manageExpField--select">
                  <label className="manageExpLabel" htmlFor="manage-exp-iam">
                    I am a…
                  </label>
                  <select id="manage-exp-iam" className="manageExpSelect" value={iam} onChange={(e) => setIam(e.target.value)}>
                    {IAM_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="manageExpField manageExpField--select">
                  <label className="manageExpLabel" htmlFor="manage-exp-focus">
                    I am focused on…
                  </label>
                  <select id="manage-exp-focus" className="manageExpSelect" value={focused} onChange={(e) => setFocused(e.target.value)}>
                    {FOCUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="manageExpField manageExpField--select">
                  <label className="manageExpLabel" htmlFor="manage-exp-follow">
                    I am also following…
                  </label>
                  <select id="manage-exp-follow" className="manageExpSelect" value={following} onChange={(e) => setFollowing(e.target.value)}>
                    {FOLLOW_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <section className="manageExpInterests" aria-labelledby="manage-exp-interests-heading">
                <h3 className="manageExpInterestsTitle" id="manage-exp-interests-heading">
                  My Interests
                </h3>
                {INTEREST_GROUPS.map((group) => (
                  <div key={group.title} className="manageExpInterestGroup">
                    <h4 className="manageExpInterestGroupTitle">{group.title}</h4>
                    {group.rows.map((row, ri) => (
                      <div key={ri} className="manageExpPillRow">
                        {row.map((label, li) => (
                          <button
                            key={`${group.title}-${ri}-${li}`}
                            type="button"
                            className={`manageExpPill ${li % 3 === 0 ? 'manageExpPill--accent' : ''}`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </section>
            </section>
          )}

          {activeTab === 'subscriptions' && (
            <section
              className="manageExpPanel"
              id="manage-exp-panel-subscriptions"
              role="tabpanel"
              aria-labelledby="manage-exp-tab-subscriptions"
            >
              <h2 className="manageExpPanelTitle" id="manage-exp-sub-heading">
                Manage Subscriptions
              </h2>
              <p className="manageExpPanelIntro">
                View and edit list subscriptions, feeds, and notification preferences. Use the bell in the header for a quick
                snapshot; this section is for deeper management.
              </p>
              <p className="manageExpPlaceholderBlock">Subscription management UI will connect to your catalog backend here.</p>
            </section>
          )}

          {activeTab === 'other' && (
            <section
              className="manageExpPanel"
              id="manage-exp-panel-other"
              role="tabpanel"
              aria-labelledby="manage-exp-tab-other"
            >
              <h2 className="manageExpPanelTitle" id="manage-exp-other-heading">
                Other Profile Option
              </h2>
              <p className="manageExpPanelIntro">Additional profile and account options can be surfaced in this section.</p>
              <p className="manageExpPlaceholderBlock">No additional settings in this prototype.</p>
            </section>
          )}
        </div>
      </main>
      </>
      </CatalogRouteShell>
    </div>
  );
}

export default ManageExperiencePage;
