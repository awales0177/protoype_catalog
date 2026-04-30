import { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import PropTypes from 'prop-types';
import {
  DATA_PROFILES_FILE_TYPES,
  DATA_PROFILES_TAGS,
  DATA_PROFILES_LANGUAGES,
  DATA_PROFILES_SCHEMA_GROUPS,
} from '../../data/sample_data';
import { publicAssetUrl } from '../../utils/publicAssetUrl';

const WORLD_MAP_TOPOLOGY = publicAssetUrl('world-countries-110m.json');
const STRENGTH_SHADES = ['#e6f2f8', '#b8dcee', '#8ac6e4', '#5cb0da', '#2e9ad0', '#2580b3', '#1c6696', '#134c7a', '#0a325d', '#061f3a'];
const hash = (s) => (String(s).split('').reduce((a, c) => a + c.charCodeAt(0), 0) >>> 0);

function DataProfilesTab({ isDataProductType, dataProfilesCountries, getFlagCode }) {
  const [profileSource, setProfileSource] = useState('system-a');

  const mainContent = (
    <div className="dataProfilesSection">
          <div className="dataProfilesRow">
            <div className="dataProfilesCard">
              <h3 className="dataProfilesCardTitle">{isDataProductType ? 'Product profiles' : 'Data profiles'}</h3>
              <div className="dataProfilesMapWrap">
                <ComposableMap
                  projection="geoEqualEarth"
                  projectionConfig={{ scale: 250, center: [10, 7] }}
                  className="dataProfilesMap"
                >
                  <Geographies geography={WORLD_MAP_TOPOLOGY}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const strength = hash(geo.rsmKey) % STRENGTH_SHADES.length;
                        const fill = STRENGTH_SHADES[strength];
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={fill}
                            stroke="var(--border-light)"
                            strokeWidth={0.4}
                            style={{ default: { outline: 'none' }, hover: { outline: 'none', fill: 'var(--accent-blue)', opacity: 0.5 }, pressed: { outline: 'none' } }}
                          />
                        );
                      })
                    }
                  </Geographies>
                </ComposableMap>
              </div>
            </div>
            <div className="dataProfilesIsosCard">
              <h3 className="dataProfilesCardTitle">Country ISOs</h3>
              <ul className="dataProfilesIsosList" aria-label="Country ISO codes">
                {dataProfilesCountries.map((c) => {
                  const alpha2 = getFlagCode ? getFlagCode(c.name) : null;
                  return (
                    <li key={c.id} className="dataProfilesIsosItem">
                      <span className={`dataProfilesFlag fi fis ${alpha2 ? `fi-${alpha2}` : ''}`} aria-hidden title={c.name} />
                      <span className="dataProfilesIsosName">{c.name}</span>
                      <span className="dataProfilesIsosCode">{c.id}</span>
                    </li>
                  );
                })}
                {dataProfilesCountries.length === 0 && (
                  <li className="dataProfilesIsosEmpty">Loading…</li>
                )}
              </ul>
            </div>
          </div>
          <div className="dataProfilesFileTypesCard">
            <h3 className="dataProfilesCardTitle">Analysis</h3>
            <div className="dataProfilesFileTypesRow">
              <span className="dataProfilesBlockLabel">File types</span>
              <div className="dataProfilesEntityGroups">
                {DATA_PROFILES_FILE_TYPES.map(({ label, count }) => (
                  <div key={label} className="dataProfilesEntityBox">
                    <span className="dataProfilesEntityLabel">{label}</span>
                    <span className="dataProfilesSchemaBoxSep">:</span>
                    <span className="dataProfilesSchemaBoxCount" aria-label={`${count} occurrences`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dataProfilesTagsRow">
              <span className="dataProfilesBlockLabel">Tags</span>
              <div className="dataProfilesEntityGroups">
                {DATA_PROFILES_TAGS.map(({ label, count }) => (
                  <div key={label} className="dataProfilesEntityBox">
                    <span className="dataProfilesEntityLabel">{label}</span>
                    <span className="dataProfilesSchemaBoxSep">:</span>
                    <span className="dataProfilesSchemaBoxCount" aria-label={`${count} occurrences`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dataProfilesSchemasRow">
              <span className="dataProfilesBlockLabel">Schemas</span>
              <div className="dataProfilesSchemaGroups">
                {DATA_PROFILES_SCHEMA_GROUPS.map(({ chips, count }, idx) => (
                  <div key={idx} className="dataProfilesSchemaBox">
                    <div className="dataProfilesSchemaChips">
                      {chips.map((chip) => (
                        <span key={chip} className="dataProfilesSchemaChip">{chip}</span>
                      ))}
                    </div>
                    <span className="dataProfilesSchemaBoxSep">:</span>
                    <span className="dataProfilesSchemaBoxCount" aria-label={`${count} occurrences`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="dataProfilesLanguagesRow">
              <span className="dataProfilesBlockLabel">Languages</span>
              <div className="dataProfilesEntityGroups">
                {DATA_PROFILES_LANGUAGES.map(({ label, count }) => (
                  <div key={label} className="dataProfilesEntityBox">
                    <span className="dataProfilesEntityLabel">{label}</span>
                    <span className="dataProfilesSchemaBoxSep">:</span>
                    <span className="dataProfilesSchemaBoxCount" aria-label={`${count} occurrences`}>{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
    </div>
  );

  if (isDataProductType) {
    return (
      <div className="assetContentLayout">
        <div className="assetContentArea">{mainContent}</div>
      </div>
    );
  }

  return (
    <div className="assetContentLayout">
      <nav className="assetSubNav" aria-label="Data profiles">
        <button
          type="button"
          className={`assetSubNavItem ${profileSource === 'system-a' ? 'active' : ''}`}
          onClick={() => setProfileSource('system-a')}
        >
          System A
        </button>
        <button
          type="button"
          className={`assetSubNavItem ${profileSource === 'system-b' ? 'active' : ''}`}
          onClick={() => setProfileSource('system-b')}
        >
          System B
        </button>
      </nav>
      <div className="assetContentArea">
        {profileSource === 'system-b' && (
          <p className="dataProfilesSourceBanner" role="status">
            Showing sample profile metrics mirrored from System A. Connect System B to show live inventory and quality scans.
          </p>
        )}
        {mainContent}
      </div>
    </div>
  );
}

DataProfilesTab.propTypes = {
  isDataProductType: PropTypes.bool.isRequired,
  dataProfilesCountries: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string, name: PropTypes.string })).isRequired,
  getFlagCode: PropTypes.func,
};

export default DataProfilesTab;
