import { useState, useMemo, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { search, assetDetail, curatedList } from '../routes';
import { LockIcon, getIconForType, ChatbotIcon, ThumbsUpIcon, ThumbsDownIcon, CheckIcon } from '../icons';
import { getTypeLabel, getTypeLabelClass } from '../utils/assetRelationships';
import { getAssetById } from '../data/assets';
import { SEARCH_DROPDOWN_META_DEFAULTS } from '../data/sample_data';
import { useSearchResults } from '../hooks/useSearchResults';
import SearchResultsSidebar from '../components/search/SearchResultsSidebar';
import SearchResultsHeroBar from '../components/search/SearchResultsHeroBar';
import SearchResultsMainToolbar from '../components/search/SearchResultsMainToolbar';
import './SearchResultsPage.css';

const CURATED_LIST_MAX_ASSETS_SHOWN = 5;

/** Topic-style pills in expanded rows: use query terms when present. */
function searchMatchPillsFromQuery(query) {
  const t = (query || '').trim();
  if (!t) return ['Topic', 'Long Long Topic', 'Topic'];
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 3) return words.slice(0, 3);
  if (words.length === 2) return [words[0], words[1], t];
  return [t, `“${t}”`, t];
}

function emptyResultsLabelForTab(activeTab) {
  switch (activeTab) {
    case 'datasets':
      return 'datasets';
    case 'data-products':
      return 'data products';
    case 'curated-lists':
      return 'curated lists';
    case 'all':
    default:
      return 'data assets';
  }
}

function transferStepStatusLabel(i, cur) {
  if (i < cur) return 'Completed';
  if (i === cur) return 'In progress';
  return 'Pending';
}

function TransferProgressStepper({ totalSteps, currentIndex, stepLabels }) {
  const steps = Math.max(2, Number(totalSteps) || 2);
  const cur = Math.min(Math.max(0, Number(currentIndex) || 0), steps - 1);
  const labelAt = (i) => (Array.isArray(stepLabels) && stepLabels[i] ? stepLabels[i] : `Stage ${i + 1}`);

  const parts = [];
  for (let i = 0; i < steps; i += 1) {
    if (i > 0) {
      const segDone = i <= cur;
      parts.push(
        <span
          key={`c-${i}`}
          className="searchRefTransferConnWrap catalogHoverTip"
          data-tip={segDone ? 'Completed — data passed this segment' : 'Pending — not reached yet'}
        >
          <span
            className={`searchRefTransferConnector ${segDone ? 'searchRefTransferConnector--active' : ''}`}
            aria-hidden
          />
        </span>
      );
    }
    const nodeClass =
      i < cur
        ? 'searchRefTransferNode searchRefTransferNode--done'
        : i === cur
          ? 'searchRefTransferNode searchRefTransferNode--current'
          : 'searchRefTransferNode searchRefTransferNode--pending';
    const stage = labelAt(i);
    const status = transferStepStatusLabel(i, cur);
    const tip =
      i === cur ? `${stage}: ${status} · Step ${cur + 1} of ${steps}` : `${stage}: ${status}`;
    parts.push(
      <span key={`n-${i}`} className="searchRefTransferHit catalogHoverTip" data-tip={tip}>
        <span className={nodeClass} aria-hidden />
      </span>
    );
  }
  return (
    <div className="searchRefTransferStepper" role="img" aria-label={`Transfer in progress, step ${cur + 1} of ${steps}`}>
      {parts}
    </div>
  );
}

function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const {
    q,
    inputValue,
    setInputValue,
    activeTab,
    setActiveTab,
    expandedDatasetId,
    expandedListId,
    filterOpen,
    results,
    curatedResults,
    displayCount,
    showCuratedContent,
    handleSubmit,
    toggleFilter,
    toggleDatasetExpand,
    setExpandedDatasetId,
    toggleCuratedListExpand,
    getDatasetFilter,
    getDataProductFilter,
    getRelatedAssets,
    isSourceDatasetType,
    DATASET_FILTER_OPTIONS,
    DATA_PRODUCT_FILTER_OPTIONS,
    showInProgressOnly,
    setShowInProgressOnly,
  } = useSearchResults(searchParams, navigate);

  const [pageSize, setPageSize] = useState(25);
  const [page, setPage] = useState(1);

  const selectFilterTab = (tabId) => {
    setActiveTab(tabId);
    const typeVal =
      tabId === 'data-products'
        ? 'data-products'
        : tabId === 'datasets'
          ? 'datasets'
          : tabId === 'curated-lists'
            ? 'curated-lists'
            : '';
    navigate(search({ q, ...(typeVal ? { type: typeVal } : {}) }));
  };

  const listBase = showCuratedContent ? curatedResults : results;
  const totalPages = Math.max(1, Math.ceil(listBase.length / pageSize));
  const pageSlice = useMemo(() => {
    const start = (page - 1) * pageSize;
    return listBase.slice(start, start + pageSize);
  }, [listBase, page, pageSize]);

  useEffect(() => {
    setPage(1);
    setExpandedDatasetId(null);
  }, [q, activeTab, showCuratedContent, showInProgressOnly, setExpandedDatasetId]);

  return (
    <div className="searchResultsPage searchResultsPage--ref">
      <SearchResultsHeroBar
        inputValue={inputValue}
        setInputValue={setInputValue}
        onSubmit={handleSubmit}
        onClear={() => {
          setInputValue('');
          navigate(search());
        }}
        searchQuery={q}
      />

      <div className="searchResultsBody searchResultsBody--ref">
        <SearchResultsSidebar
          q={q}
          inputValue={inputValue}
          setInputValue={setInputValue}
          onSearchSubmit={handleSubmit}
          onClearQuery={() => {
            setInputValue('');
            navigate(search());
          }}
          activeTab={activeTab}
          onSelectFilterTab={selectFilterTab}
          filterOpen={filterOpen}
          toggleFilter={toggleFilter}
          getDatasetFilter={getDatasetFilter}
          getDataProductFilter={getDataProductFilter}
          datasetFilterOptions={DATASET_FILTER_OPTIONS}
          dataProductFilterOptions={DATA_PRODUCT_FILTER_OPTIONS}
          showInProgressOnly={showInProgressOnly}
          setShowInProgressOnly={setShowInProgressOnly}
        />

        <main className="searchResultsMain searchResultsMain--ref">
          <SearchResultsMainToolbar
            displayCount={displayCount}
            pageSize={pageSize}
            setPageSize={setPageSize}
            onPageSizeChange={() => setPage(1)}
          />

          <div className="searchResultsContent">
            {showCuratedContent ? (
              curatedResults.length > 0 ? (
                <ul className="searchResultsList curatedListsList">
                  {pageSlice.map((list) => {
                    const isExpanded = expandedListId === list.id;
                    const assetIds = list.assetIds || [];
                    const shownCount = Math.min(assetIds.length, CURATED_LIST_MAX_ASSETS_SHOWN);
                    const moreCount = assetIds.length - shownCount;
                    return (
                      <li key={list.id} className="searchResultCard curatedListCard">
                        <div className="curatedListCardInner">
                          <div className="searchResultLabelCol">
                            <span className="searchResultLabel list">LIST</span>
                            <button
                              type="button"
                              className={`searchResultExpandBtn ${isExpanded ? 'expanded' : ''}`}
                              onClick={(e) => toggleCuratedListExpand(e, list.id)}
                              aria-expanded={isExpanded}
                              aria-label={isExpanded ? 'Collapse' : 'Show assets in this list'}
                              title={`${assetIds.length} assets in list`}
                            >
                              ▾
                            </button>
                          </div>
                          <div className="curatedListCardBody">
                            <Link to={curatedList(list.id)} className="curatedListCardTitleLink">
                              <span className="curatedListCardTitle">{list.title}</span>
                            </Link>
                            {list.description && <p className="curatedListCardDesc">{list.description}</p>}
                            <span className="curatedListCardMeta">
                              {list.assetIds.length} assets · {list.owner} · Updated {list.updated}
                            </span>
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="searchResultDropdown curatedListDropdown">
                            <div className="searchResultDropdownRelated">
                              <div className="searchResultRelatedSection">
                                <h4 className="searchResultRelatedTitle">Data Assets in this list</h4>
                                <ul className="searchResultRelatedList" aria-label="Assets in list">
                                  {assetIds.slice(0, shownCount).map((assetId) => {
                                    const asset = getAssetById(assetId);
                                    return (
                                      <li key={assetId}>
                                        <Link to={assetDetail(assetId)} className="searchResultRelatedLink">
                                          {getTypeLabel(asset.type) && (
                                            <span className={`searchResultRelatedLabel ${getTypeLabelClass(asset.type)}`}>{getTypeLabel(asset.type)}</span>
                                          )}
                                          {asset.name}
                                        </Link>
                                      </li>
                                    );
                                  })}
                                  {moreCount > 0 && (
                                    <li className="curatedListMore">
                                      <span className="curatedListMoreText">{moreCount} more</span>
                                    </li>
                                  )}
                                </ul>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="searchResultsEmpty">No curated lists for this search.</p>
              )
            ) : results.length > 0 ? (
                <ul className="searchResultsList">
                  {pageSlice.map((asset) => {
                    const canExpand = isSourceDatasetType(asset.type) || Boolean(asset.transferProgress);
                    const isExpanded = canExpand && expandedDatasetId === asset.id;
                    const related = canExpand ? getRelatedAssets(asset.id) : null;
                    const hasSiblings = asset.type === 'Child dataset' && related?.siblingDatasets?.length > 0;
                    const hasRelated = related && ((related.childDatasets && related.childDatasets.length > 0) || hasSiblings || related.dataProducts.length > 0);
                    const RowIcon = getIconForType(asset.type);

                    return (
                      <li key={asset.id} className="searchResultCard searchResultCard--ref">
                        <div className="searchRefResultRow">
                          <div className="searchRefResultGlyph" aria-hidden>
                            <RowIcon />
                          </div>
                          <Link to={assetDetail(asset.id)} className="searchRefResultTitleLink">
                            <span className="searchRefResultTitleText">{asset.title}</span>
                            <span className="searchResultSubtitle searchRefResultMeta">
                              {asset.type}
                              {asset.type !== 'Adoption record' && (
                                <span className={`searchResultStatusBadge ${asset.stale ? 'stale' : asset.feed ? 'feed' : 'single'}`}>
                                  {asset.stale ? 'Stale' : asset.feed ? 'Feed' : 'Single'}
                                </span>
                              )}
                              {asset.noDataAccess && (
                                <span className="searchResultLockIcon" title="No data access" aria-label="No data access">
                                  <LockIcon />
                                </span>
                              )}
                            </span>
                          </Link>
                          <div className="searchRefResultStats">
                            {asset.transferProgress ? (
                              <TransferProgressStepper
                                totalSteps={asset.transferProgress.totalSteps}
                                currentIndex={asset.transferProgress.currentIndex}
                                stepLabels={asset.transferProgress.stepLabels}
                              />
                            ) : (
                              [1, 2, 3, 4, 5].map((i) => (
                                <button key={i} type="button" className="searchRefStatBtn" tabIndex={-1} aria-hidden>
                                  <ChatbotIcon />
                                  <span>3</span>
                                </button>
                              ))
                            )}
                          </div>
                          <div className="searchRefResultTrail">
                            {getTypeLabel(asset.type) && (
                              <span className={`searchResultLabel ${getTypeLabelClass(asset.type)}`}>{getTypeLabel(asset.type)}</span>
                            )}
                            {canExpand && (
                              <button
                                type="button"
                                className={`searchResultExpandBtn searchRefExpandChev ${isExpanded ? 'expanded' : ''}`}
                                onClick={(e) => toggleDatasetExpand(e, asset.id)}
                                aria-expanded={isExpanded}
                                aria-label={isExpanded ? 'Collapse' : 'Expand record'}
                                title={
                                  hasRelated
                                    ? asset.type === 'Child dataset'
                                      ? `${(related.siblingDatasets || []).length} siblings, ${related.dataProducts.length} products`
                                      : `${(related.childDatasets || []).length} children, ${related.dataProducts.length} products`
                                    : 'None'
                                }
                              >
                                {'\u25be'}
                              </button>
                            )}
                          </div>
                        </div>
                        {isExpanded && (
                          <div className="searchResultDropdown">
                            <div className="searchResultDropdownRelated">
                              {asset.type === 'Child dataset' && related.siblingDatasets && related.siblingDatasets.length > 0 && (
                                <div className="searchResultRelatedSection">
                                  <h4 className="searchResultRelatedTitle">Sibling datasets</h4>
                                  <ul className="searchResultRelatedList">
                                    {related.siblingDatasets.map((a) => (
                                      <li key={a.id}>
                                        <Link to={assetDetail(a.id)} className="searchResultRelatedLink">
                                          {getTypeLabel(a.type) && (
                                            <span className={`searchResultRelatedLabel ${getTypeLabelClass(a.type)}`}>{getTypeLabel(a.type)}</span>
                                          )}
                                          {a.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {asset.type !== 'Child dataset' && related.childDatasets && related.childDatasets.length > 0 && (
                                <div className="searchResultRelatedSection">
                                  <h4 className="searchResultRelatedTitle">Child datasets</h4>
                                  <ul className="searchResultRelatedList">
                                    {related.childDatasets.map((a) => (
                                      <li key={a.id}>
                                        <Link to={assetDetail(a.id)} className="searchResultRelatedLink">
                                          {getTypeLabel(a.type) && (
                                            <span className={`searchResultRelatedLabel ${getTypeLabelClass(a.type)}`}>{getTypeLabel(a.type)}</span>
                                          )}
                                          {a.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {related.dataProducts.length > 0 && (
                                <div className="searchResultRelatedSection">
                                  <h4 className="searchResultRelatedTitle">Data products</h4>
                                  <ul className="searchResultRelatedList">
                                    {related.dataProducts.map((a) => (
                                      <li key={a.id}>
                                        <Link to={assetDetail(a.id)} className="searchResultRelatedLink">
                                          {getTypeLabel(a.type) && (
                                            <span className={`searchResultRelatedLabel ${getTypeLabelClass(a.type)}`}>{getTypeLabel(a.type)}</span>
                                          )}
                                          {a.title}
                                        </Link>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {!hasRelated && (
                                <p className="searchResultRelatedEmpty">{asset.type === 'Child dataset' ? 'No sibling datasets or data products.' : 'No child datasets or data products for this dataset.'}</p>
                              )}
                            </div>
                            <div className="searchResultDropdownDescWrap">
                              {asset.desc && (
                                <>
                                  <h4 className="searchResultDropdownDescLabel">Description</h4>
                                  <p className="searchResultDropdownDesc">{asset.desc}</p>
                                </>
                              )}
                              <div className="searchRefExpandedExtras">
                                <div className="searchRefUSJA">
                                  {['U', 'S', 'J'].map((letter) => (
                                    <span key={letter} className="searchRefUSJABox">
                                      {letter}
                                    </span>
                                  ))}
                                  <span className="searchRefAccessGranted">
                                    <CheckIcon /> Access Granted
                                  </span>
                                </div>
                                <div className="searchRefTopicPills">
                                  {searchMatchPillsFromQuery(q).map((pill, idx) => (
                                    <span key={`${pill}-${idx}`} className="searchRefTopicPill">
                                      {pill}
                                    </span>
                                  ))}
                                </div>
                                <div className="searchRefLineageRow">
                                  <button type="button" className="searchRefLineageBtn">
                                    3 Parents
                                  </button>
                                  <button type="button" className="searchRefLineageBtn">
                                    17 Children
                                  </button>
                                  <button type="button" className="searchRefLineageBtn">
                                    In 19 Products
                                  </button>
                                </div>
                                <div className="searchRefCommunity">
                                  <button type="button" className="searchRefThumbBtn">
                                    <ThumbsUpIcon /> ###
                                  </button>
                                  <button type="button" className="searchRefThumbBtn">
                                    <ThumbsDownIcon /> ###
                                  </button>
                                </div>
                                <div className="searchRefAvailability">
                                  <span className="searchRefAvailBadge">
                                    <CheckIcon /> Use in ## Apps
                                  </span>
                                  <span className="searchRefAvailBadge">
                                    <CheckIcon /> Approved for ## Apps
                                  </span>
                                </div>
                              </div>
                              <div className="searchResultDropdownMeta">
                                <h4 className="searchResultDropdownDescLabel">{SEARCH_DROPDOWN_META_DEFAULTS.keyMetadataLabel}</h4>
                                <dl className="searchResultDropdownMetaList">
                                  <div className="searchResultDropdownMetaRow">
                                    <dt className="searchResultDropdownMetaKey">Type</dt>
                                    <dd className="searchResultDropdownMetaValue">{asset.type}</dd>
                                  </div>
                                  <div className="searchResultDropdownMetaRow">
                                    <dt className="searchResultDropdownMetaKey">Owner</dt>
                                    <dd className="searchResultDropdownMetaValue">{SEARCH_DROPDOWN_META_DEFAULTS.owner}</dd>
                                  </div>
                                  <div className="searchResultDropdownMetaRow">
                                    <dt className="searchResultDropdownMetaKey">Last updated</dt>
                                    <dd className="searchResultDropdownMetaValue">{SEARCH_DROPDOWN_META_DEFAULTS.lastUpdated}</dd>
                                  </div>
                                </dl>
                              </div>
                            </div>
                          </div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              ) : (
              <p className="searchResultsEmpty">
                {q ? `No data assets match "${q}"` : `No ${emptyResultsLabelForTab(activeTab)} found.`}
              </p>
              )}
          </div>
          {totalPages > 1 && (
            <nav className="searchRefPagination" id="search-results-end" aria-label="Pagination">
              <button
                type="button"
                className="searchRefPageBtn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                ← Previous
              </button>
              <div className="searchRefPageNums">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                  <button
                    key={num}
                    type="button"
                    className={`searchRefPageNum ${num === page ? 'active' : ''}`}
                    onClick={() => setPage(num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="searchRefPageBtn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next →
              </button>
            </nav>
          )}
        </main>
      </div>
    </div>
  );
}

SearchResultsPage.propTypes = {};

export default SearchResultsPage;
