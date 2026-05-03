import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { feature } from 'topojson-client';
import { catalogData } from '../services/catalogApi';
import { getAlpha2 } from '../data/flagCodes';
import {
  getInitialAssetComments,
  getAssetAttachments,
  getAssetHistoryLogs,
  README_MARKDOWN,
} from '../data/assetMockData';
import { ASSET_OVERVIEW_DEFAULTS } from '../data/sample_data';
import { CURATED_LISTS } from '../data/curatedLists';
import '../icons/flag-icons-main/css/flag-icons.min.css';
import AssetDetails from '../components/asset/AssetDetails';
import ProductDataLineage from '../components/asset/ProductDataLineage';
import LineageValidationPanel from '../components/asset/LineageValidationPanel';
import ExploreBucket from '../components/asset/ExploreBucket';
import DataProfilesTab from '../components/asset/DataProfilesTab';
import ReadmeTab from '../components/asset/ReadmeTab';
import ProductToolingTab from '../components/asset/ProductToolingTab';
import AssetPageTabStrip from '../components/asset/AssetPageTabStrip';
import AssetProjectValueCard from '../components/asset/AssetProjectValueCard';
import AssetAccessCard from '../components/asset/AssetAccessCard';
import AssetRecordChrome from '../components/asset/AssetRecordChrome';
import AssetRecordTitleCard from '../components/asset/AssetRecordTitleCard';
import AssetCuratedListsCard from '../components/asset/AssetCuratedListsCard';
import { publicAssetUrl } from '../utils/publicAssetUrl';
import { getProductToolingForAsset } from '../data/productTooling';
import './AssetPage.css';

const WORLD_MAP_TOPOLOGY = publicAssetUrl('world-countries-110m.json');

/** Maps title-card U/S/J chips to secondary pane tabs (Lineage → Data lake). */
const USJA_SECONDARY_TABS = ['data-lineage', 'data-profiles', 'explore-bucket'];

function LineageFullscreenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path
        d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function AssetPage() {
  const { id } = useParams();
  const assetId = (id || '').toLowerCase();
  const asset = catalogData.getAssetById(assetId);
  const assetsById = catalogData.getAssetsMap();

  const assetType = (asset.type || '').toLowerCase();
  const isDataProductType = [
    'data product',
    'aggregated data product',
    'derived data product',
    'child data product',
    'transfer record',
  ].includes(assetType);
  const isTopic = assetType === 'topic';
  const isDataset = ['parent dataset', 'child dataset', 'adoption record'].includes(assetType);

  const [secondaryTab, setSecondaryTab] = useState('data-lineage');
  const [detailsPrimaryTab, setDetailsPrimaryTab] = useState('details');
  const [productionTab, setProductionTab] = useState('production');
  const [recordCommentsTab, setRecordCommentsTab] = useState('comments');
  const [dataProfilesCountries, setDataProfilesCountries] = useState([]);
  const [comments, setComments] = useState(() => getInitialAssetComments(assetId));
  const [newCommentText, setNewCommentText] = useState('');

  useEffect(() => {
    setComments(getInitialAssetComments(assetId));
  }, [assetId]);

  useEffect(() => {
    if (!isDataProductType && (secondaryTab === 'validation' || secondaryTab === 'tooling')) {
      setSecondaryTab('data-lineage');
    }
  }, [assetId, isDataProductType, secondaryTab]);

  useEffect(() => {
    if (secondaryTab === 'data-volume') {
      setSecondaryTab('explore-bucket');
    }
    if (secondaryTab === 'metrics') {
      setSecondaryTab('data-lineage');
    }
    if (secondaryTab === 'download') {
      setSecondaryTab('data-lineage');
    }
  }, [secondaryTab]);

  const productToolingRows = useMemo(
    () => (isDataProductType ? getProductToolingForAsset(assetId) : []),
    [assetId, isDataProductType]
  );

  function postComment() {
    const text = newCommentText.trim();
    if (!text) return;
    const now = new Date();
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: 'You',
        authorInitials: 'Y',
        date: now.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).replace(/,/g, ''),
        time: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        body: text,
      },
    ]);
    setNewCommentText('');
  }

  useEffect(() => {
    if (secondaryTab !== 'data-profiles') return undefined;
    const ac = new AbortController();
    fetch(WORLD_MAP_TOPOLOGY, { signal: ac.signal })
      .then((r) => r.json())
      .then((topology) => {
        if (ac.signal.aborted) return;
        if (topology.objects?.countries) {
          const fc = feature(topology, topology.objects.countries);
          const list = (fc.features || [])
            .map((f) => ({ name: f.properties?.name || f.id, id: f.id }))
            .filter((c) => c.name && c.id)
            .sort((a, b) => String(a.name).localeCompare(b.name));
          setDataProfilesCountries(list);
        }
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        setDataProfilesCountries([]);
      });
    return () => ac.abort();
  }, [secondaryTab]);

  const breadcrumbCategory = isDataProductType || isTopic ? 'Data product' : 'Dataset';
  const categoryLabel = [breadcrumbCategory, asset.type].join(' · ');

  const usjaActiveIndices = useMemo(() => {
    const lineageRelated =
      secondaryTab === 'data-lineage' || (isDataProductType && secondaryTab === 'validation');
    const tabIdx = USJA_SECONDARY_TABS.indexOf(lineageRelated ? 'data-lineage' : secondaryTab);
    if (tabIdx < 0) return [];
    const set = new Set([tabIdx]);
    if (tabIdx > 0) set.add(0);
    return [...set].sort((a, b) => a - b);
  }, [secondaryTab, isDataProductType]);

  const descSecondary =
    'Operational notes, steward contacts, and compliance context can be expanded here as the record matures in the catalog.';

  const secondaryPane = (
    <>
      {secondaryTab === 'data-lineage' && (
        <div className="assetRecordLineageShell assetRecordLineageShell--tabsOnly">
          <div className="assetRecordLineageStage assetRecordLineageStage--tabsOnly">
            <div className="assetRecordLineageCanvasWrap">
              <ProductDataLineage
                assetId={assetId}
                asset={asset}
                assetsById={assetsById}
                variant={isDataProductType ? 'product' : 'dataset'}
              />
              <button type="button" className="assetRecordLineageFs" aria-label="Fullscreen">
                <LineageFullscreenIcon />
              </button>
            </div>
          </div>
        </div>
      )}

      {secondaryTab === 'validation' && isDataProductType && (
        <LineageValidationPanel
          assetId={assetId}
          asset={asset}
          assetsById={assetsById}
          variant="product"
        />
      )}

      {secondaryTab === 'tooling' && isDataProductType && <ProductToolingTab tools={productToolingRows} />}

      {secondaryTab === 'data-profiles' && (
        <DataProfilesTab
          isDataProductType={isDataProductType}
          dataProfilesCountries={dataProfilesCountries}
          getFlagCode={getAlpha2}
        />
      )}

      {secondaryTab === 'readme' && isDataProductType && <ReadmeTab content={README_MARKDOWN} />}

      {secondaryTab === 'explore-bucket' && (isDataProductType || isDataset) && (
        <ExploreBucket asset={asset} assetId={assetId} />
      )}
    </>
  );

  return (
    <div className="assetPage assetPage--record">
      <AssetRecordChrome assetName={asset.name} />

      <div className="assetRecordTitleWrap">
        <AssetRecordTitleCard
          assetName={asset.name}
          categoryLabel={categoryLabel}
          assetId={assetId}
          usjaActiveIndices={usjaActiveIndices}
          onRequestAccess={() => document.getElementById('asset-access-heading')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
        />
      </div>

      <div className="assetRecordBody">
        <div className="assetRecordMainCol">
          <section id="asset-record-details" className="assetRecordCard">
            <div className="assetRecordCardTabs" role="tablist" aria-label="Record details">
              {['details', 'tags', 'compliance', 'poc'].map((tab) => {
                const labels = {
                  details: 'Details',
                  tags: 'Tags',
                  compliance: 'Compliance',
                  poc: 'Points of Contact',
                };
                return (
                  <button
                    key={tab}
                    type="button"
                    role="tab"
                    aria-selected={detailsPrimaryTab === tab}
                    className={`assetRecordTab ${detailsPrimaryTab === tab ? 'active' : ''}`}
                    onClick={() => setDetailsPrimaryTab(tab)}
                  >
                    {labels[tab]}
                  </button>
                );
              })}
            </div>
            <div className="assetRecordCardBody">
              {detailsPrimaryTab === 'details' && (
                <>
                  <div className="assetRecordDetailsGrid">
                    <div className="assetRecordDescBlock">
                      <h2>Description</h2>
                      <p className="assetRecordDescText">{asset.description}</p>
                      <p className="assetRecordDescText">{descSecondary}</p>
                      <div className="assetRecordTopics">
                        <span className="assetRecordTopicsLabel">Topics</span>
                        <div className="assetRecordTopicPills">
                          {['Topic', 'Long Long Topic', 'Topic'].map((t) => (
                            <span key={t} className="assetRecordTopicPill">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="overviewMetaGrid assetRecordMetaGrid">
                      <div className="overviewMetaRow">
                        <span className="overviewMetaKey">Location</span>
                        <span className="overviewMetaValue">{ASSET_OVERVIEW_DEFAULTS.s3LocationBase}</span>
                      </div>
                      <div className="overviewMetaRow">
                        <span className="overviewMetaKey">Temporal extent</span>
                        <span className="overviewMetaValue">Jan 2023 — Present</span>
                      </div>
                      <div className="overviewMetaRow">
                        <span className="overviewMetaKey">Field label</span>
                        <span className="overviewMetaValue">Placeholder value</span>
                      </div>
                      <div className="overviewMetaRow">
                        <span className="overviewMetaKey">Owner</span>
                        <span className="overviewMetaValue">
                          <a href={ASSET_OVERVIEW_DEFAULTS.ownerHref}>{ASSET_OVERVIEW_DEFAULTS.owner}</a>
                        </span>
                      </div>
                      <div className="overviewMetaRow">
                        <span className="overviewMetaKey">Status</span>
                        <span className="overviewMetaValue">
                          <span className="overviewStatusPill approved">{ASSET_OVERVIEW_DEFAULTS.status}</span>
                        </span>
                      </div>
                      <div className="overviewMetaRow">
                        <span className="overviewMetaKey">Source system</span>
                        <span className="overviewMetaValue">{ASSET_OVERVIEW_DEFAULTS.sourceSystem}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
              {detailsPrimaryTab === 'tags' && (
                <p className="assetRecordPlaceholder">Structured tags and synonyms for discovery will be listed here.</p>
              )}
              {detailsPrimaryTab === 'compliance' && (
                <p className="assetRecordPlaceholder">
                  Classification: Customer Personal Info. Retention and legal basis references attach to this section.
                </p>
              )}
              {detailsPrimaryTab === 'poc' && (
                <p className="assetRecordPlaceholder">Data stewards and technical contacts for this record.</p>
              )}
            </div>
          </section>

          <section id="asset-record-lineage" className="assetRecordCard">
            <AssetPageTabStrip
              activeTab={secondaryTab}
              setActiveTab={setSecondaryTab}
              isDataProductType={isDataProductType}
              isDataset={isDataset}
              recordLayout
            />
            <div className={`assetRecordCardBody ${secondaryTab === 'data-lineage' ? 'assetRecordCardBody--flush' : ''}`}>{secondaryPane}</div>
          </section>

          <section id="asset-record-production" className="assetRecordCard">
            <div className="assetRecordCardTabs" role="tablist">
              {[
                { id: 'production', label: 'Production (3)' },
                { id: 'sources', label: 'Sources (3)' },
                { id: 'sharing', label: 'Sharing (3)' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  className={`assetRecordTab ${productionTab === t.id ? 'active' : ''}`}
                  onClick={() => setProductionTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <div className="assetRecordCardBody">
              <p className="assetRecordPlaceholder" style={{ minHeight: 100, margin: 0 }}>
                {productionTab === 'production' && 'Production pipelines, schedules, and SLAs for this record.'}
                {productionTab === 'sources' && 'Upstream sources and ingestion contracts.'}
                {productionTab === 'sharing' && 'Sharing rules, consumer apps, and export policies.'}
              </p>
            </div>
          </section>

          <section id="asset-record-comments" className="assetRecordCard">
            <div className="assetRecordCardTabs" role="tablist">
              <button
                type="button"
                className={`assetRecordTab ${recordCommentsTab === 'comments' ? 'active' : ''}`}
                onClick={() => setRecordCommentsTab('comments')}
              >
                Comments ({comments.length})
              </button>
              <button
                type="button"
                className={`assetRecordTab ${recordCommentsTab === 'trends' ? 'active' : ''}`}
                onClick={() => setRecordCommentsTab('trends')}
              >
                Trends
              </button>
            </div>
            <div className="assetRecordCardBody">
              {recordCommentsTab === 'comments' && (
                <AssetDetails
                  asset={asset}
                  assetId={assetId}
                  summarySection="comments"
                  setSummarySection={() => {}}
                  comments={comments}
                  newCommentText={newCommentText}
                  setNewCommentText={setNewCommentText}
                  postComment={postComment}
                  isDataProductType={isDataProductType}
                  attachments={getAssetAttachments(assetId)}
                  historyLogs={getAssetHistoryLogs(assetId)}
                  variant="recordComments"
                />
              )}
              {recordCommentsTab === 'trends' && (
                <p className="assetRecordPlaceholder" style={{ margin: 0 }}>
                  Comment volume, sentiment, and steward response trends will display here.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="assetRecordRail">
          <AssetProjectValueCard variant="record" />
          <AssetAccessCard asset={asset} isDataProductType={isDataProductType} variant="record" />
          <AssetCuratedListsCard lists={CURATED_LISTS} />
        </aside>
      </div>
    </div>
  );
}

AssetPage.propTypes = {};

export default AssetPage;
