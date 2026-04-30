import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { search, assetDetail } from '../routes';
import { getCuratedListById } from '../data/curatedLists';
import { DATA_ASSETS, getAssetById } from '../data/assets';
import { BREADCRUMB_LABELS } from '../data/sample_data';
import { getTypeLabel, getTypeLabelClass } from '../utils/assetRelationships';
import { LockIcon, getIconForType, ListIcon, GridIcon } from '../icons';
import CatalogRouteShell from '../components/shell/CatalogRouteShell';
import './AssetPage.css';

function CuratedListPage() {
  const { id } = useParams();
  const listId = (id || '').toLowerCase();
  const list = getCuratedListById(listId);
  const [viewMode, setViewMode] = useState('card'); // 'list' | 'card'

  if (!list) {
    return (
      <div className="assetPage">
        <div className="assetHero assetHero--toolbarOnly" aria-hidden />
        <CatalogRouteShell>
        <div className="assetBody assetBody--noOverlap">
          <div className="assetMain assetMain--plain">
            <div className="assetMainPane">
              <p className="assetFieldValue">Curated list not found.</p>
              <Link to={search({ type: 'curated-lists' })} className="assetTextBtn">Back to CuratedLists</Link>
            </div>
          </div>
        </div>
        </CatalogRouteShell>
      </div>
    );
  }

  const breadcrumbs = [
    { id: 'curated', label: BREADCRUMB_LABELS.curatedLists, to: search({ type: 'curated-lists' }) },
    { id: 'current', label: list.title, to: null },
  ];

  return (
    <div className="assetPage">
      <div className="assetHero">
        <nav className="assetBreadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((crumb, i) => (
            <span key={crumb.id}>
              {i > 0 && ' / '}
              {crumb.to ? (
                <Link to={crumb.to}>{crumb.label}</Link>
              ) : (
                <span className="assetBreadcrumbCurrent">{crumb.label}</span>
              )}
            </span>
          ))}
        </nav>
        <div className="assetTitleRow">
          <div className="assetTitleBlock">
            <span className="assetTitleIcon assetTitleIconList" aria-hidden>LIST</span>
            <h1 className="assetTitle">{list.title}</h1>
          </div>
          <div className="assetTitleRight">
            <div className="assetBadges">
              <span className={`assetStatusBadge curatedListVisibilityBadge ${(list.visibility || 'private') === 'public' ? 'public' : 'private'}`}>
                {(list.visibility || 'private') === 'public' ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <CatalogRouteShell>
      <div className="assetBody">
        <div className="assetMain assetMain--plain">
          <div className="assetMainPane">
          <div className="assetContentLayout curatedListMain">
            <div className="assetContentArea">
              {list.description && (
                <div className="curatedListPageDescBlock">
                  <h4 className="curatedListPageDescLabel">Description</h4>
                  <p className="curatedListPageDesc">{list.description}</p>
                </div>
              )}
              <div className="curatedListPageViewBar">
                <div className="curatedListPageViewToggle" role="group" aria-label="View mode">
                  <button
                    type="button"
                    className={`curatedListPageViewBtn ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                    aria-label="List view"
                    aria-pressed={viewMode === 'list'}
                    title="List view"
                  >
                    <ListIcon />
                  </button>
                  <button
                    type="button"
                    className={`curatedListPageViewBtn ${viewMode === 'card' ? 'active' : ''}`}
                    onClick={() => setViewMode('card')}
                    aria-label="Card view"
                    aria-pressed={viewMode === 'card'}
                    title="Card view"
                  >
                    <GridIcon />
                  </button>
                </div>
              </div>
              {viewMode === 'list' ? (
                <ul className="curatedListPageAssetList" aria-label="Assets in list">
                  {list.assetIds.map((assetId) => {
                    const detail = getAssetById(assetId);
                    return (
                      <li key={assetId}>
                        <Link to={assetDetail(assetId)} className="curatedListPageAssetLink">
                          {getTypeLabel(detail.type) && (
                            <span className={`relationshipsTypeChip ${getTypeLabelClass(detail.type)}`}>{getTypeLabel(detail.type)}</span>
                          )}
                          <span className="curatedListPageAssetName">{detail.name}</span>
                          <span className="curatedListPageAssetType">{detail.type}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="curatedListCardGrid" role="list">
                  {list.assetIds.map((assetId) => {
                    const asset = DATA_ASSETS.find((a) => a.id === assetId) || null;
                    const detail = getAssetById(assetId);
                    const AssetIcon = getIconForType(detail.type);
                    return (
                      <Link key={assetId} to={assetDetail(assetId)} className="curatedListCardTile" role="listitem">
                        <span className="curatedListCardIcon" aria-hidden><AssetIcon /></span>
                        <span className="curatedListCardTitle">{detail.name}</span>
                        <span className="curatedListCardType">{detail.type}</span>
                        {asset?.desc && <p className="curatedListCardDesc">{asset.desc}</p>}
                        <div className="curatedListCardBadges">
                          {detail.type !== 'Adoption record' && (
                            <span className={`assetStatusBadge ${asset?.stale ? 'stale' : asset?.feed ? 'feed' : 'single'}`}>{asset?.stale ? 'Stale' : asset?.feed ? 'Feed' : 'Single'}</span>
                          )}
                          {detail.noDataAccess && <span className="curatedListCardLock" aria-label="No data access"><LockIcon /></span>}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
          </div>
        </div>

        <aside className="assetSidebar">
          <div className="assetSidebarTitle">Quick View</div>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Type</div>
            <div className="assetSidebarValue">Curated list</div>
          </div>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Owner</div>
            <div className="assetSidebarValue">{list.owner}</div>
          </div>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Updated</div>
            <div className="assetSidebarValue">{list.updated}</div>
          </div>
          <div className="assetSidebarSection">
            <div className="assetSidebarLabel">Assets</div>
            <div className="assetSidebarValue">{list.assetIds.length}</div>
          </div>
          {list.curators && list.curators.length > 0 && (
            <div className="assetSidebarSection">
              <div className="assetSidebarLabel">Curators</div>
              <div className="assetSidebarProfiles">
                {list.curators.map((name) => (
                  <div key={name} className="assetSidebarProfileRow">
                    <span className="assetAvatar" aria-hidden>{name.split(' ').map((n) => n[0]).join('')}</span>
                    <span className="assetSidebarProfileName">{name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="assetSidebarSection">
            <Link to={search({ type: 'curated-lists' })} className="assetSidebarLink">Back to CuratedLists</Link>
          </div>
        </aside>
      </div>
      </CatalogRouteShell>
    </div>
  );
}

CuratedListPage.propTypes = {};

export default CuratedListPage;
