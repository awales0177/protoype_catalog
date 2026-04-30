import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { search, assetDetail, curatedList } from '../routes';
import { DATA_ASSETS } from '../data/assets';
import { CURATED_LISTS } from '../data/curatedLists';
import HomeHeroChrome from '../components/home/HomeHeroChrome';
import './HomePage.css';

const DISCOVER_TABS = ['By Type', 'By Topic', 'By Region', 'By Lake', 'By Org'];
const TRENDING_TABS = ['Trending', 'Most Recommended'];
const NEW_LEFT_TABS = ['New Products', 'New Sets', 'Recently Deployed'];
const NEW_RIGHT_TABS = ['New Lists', 'Recently Updated Lists'];

const DISCOVER_BY_TYPE = [
  { label: 'Products', dotClass: 'homeTypeDot--blue', count: '1,248', to: search({ type: 'data-products' }) },
  { label: 'Sets', dotClass: 'homeTypeDot--violet', count: '384', to: search({ type: 'datasets' }) },
  { label: 'Commercial', dotClass: 'homeTypeDot--sky', count: '912', to: search({ q: 'Commercial' }) },
  { label: 'Business', dotClass: 'homeTypeDot--teal', count: '2,016', to: search({ q: 'Business' }) },
];

function HomePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverTab, setDiscoverTab] = useState(0);
  const [trendingTab, setTrendingTab] = useState(0);
  const [newLeftTab, setNewLeftTab] = useState(0);
  const [newRightTab, setNewRightTab] = useState(0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const trimmed = searchQuery.trim();
    navigate(trimmed ? search({ q: trimmed }) : search());
  };

  const trendingItems = DATA_ASSETS.slice(0, 6);
  const newProductItems = DATA_ASSETS.slice(0, 5);

  return (
    <div className="homePage">
      <HomeHeroChrome inputValue={searchQuery} setInputValue={setSearchQuery} onSubmit={handleSearchSubmit} />

      <main className="homeMain">
        <section className="homeSection" aria-labelledby="discover-heading">
          <h2 id="discover-heading" className="homeSectionTitle">
            Discover
          </h2>
          <div className="homeDiscoverGrid">
            <div className="homeCard">
              <div className="homeCardTabs" role="tablist" aria-label="Discover filters">
                {DISCOVER_TABS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={discoverTab === i}
                    className={`homeCardTab ${discoverTab === i ? 'homeCardTab--active' : ''}`}
                    onClick={() => setDiscoverTab(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="homeDiscoverSplit">
                <ul className="homeDiscoverList">
                  {DISCOVER_BY_TYPE.map((row) => (
                    <li key={row.label}>
                      <Link className="homeDiscoverRow" to={row.to}>
                        <span className="homeDiscoverRowLead" aria-hidden>
                          <span className={`homeTypeDot ${row.dotClass}`} />
                        </span>
                        <span className="homeDiscoverRowLabel">{row.label}</span>
                        <span className="homeDiscoverRowMeta">{row.count}</span>
                        <span className="homeRowChevron" aria-hidden>
                          ›
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="homeDonutWrap" aria-hidden>
                  <div className="homeDonut" title="Distribution snapshot" />
                </div>
              </div>
            </div>

            <div className="homeCard">
              <div className="homeCardTabs" role="tablist" aria-label="Trending">
                {TRENDING_TABS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={trendingTab === i}
                    className={`homeCardTab ${trendingTab === i ? 'homeCardTab--active' : ''}`}
                    onClick={() => setTrendingTab(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ul className="homeDiscoverList">
                {(trendingTab === 0 ? trendingItems : trendingItems.slice().reverse()).map((asset, idx) => (
                  <li key={`${asset.id}-${idx}`}>
                    <Link className="homeDiscoverRow" to={assetDetail(asset.id)}>
                      <span className="homeDiscoverRowLead" aria-hidden />
                      <span className="homeDiscoverRowLabel">{asset.title}</span>
                      <span className="homeDiscoverRowMeta">#{(4280 + idx * 173).toLocaleString()}</span>
                      <span className="homeRowChevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="homeCardFooter">
                <Link className="homeCardFooterLink" to={search()}>
                  View all <span aria-hidden>›</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="homeSection" aria-labelledby="mycatalog-heading">
          <h2 id="mycatalog-heading" className="homeSectionTitle">
            My Catalog
          </h2>
          <div className="homeThreeCol">
            <div className="homeCard">
              <h3 className="homeCardHeadTitle">Saved searches</h3>
              <ul className="homeSimpleList">
                {['Bronze quality checks', 'PII classification', 'Customer 360 lineage'].map((label) => (
                  <li key={label}>
                    <Link className="homeSimpleRow" to={search({ q: label.toLowerCase() })}>
                      <span className="homeSimpleRowText">My search term · {label}</span>
                      <span className="homeRowChevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="homeCard">
              <h3 className="homeCardHeadTitle">Subscriptions</h3>
              <ul className="homeSimpleList">
                <li>
                  <Link className="homeSimpleRow" to={search({ q: 'topic:freshness' })}>
                    <span className="homeSimpleRowText">Topic subscription · Pipeline health</span>
                    <span className="homeRowChevron" aria-hidden>
                      ›
                    </span>
                  </Link>
                </li>
                <li>
                  <Link className="homeSimpleRow" to={search({ q: 'list:gold' })}>
                    <span className="homeSimpleRowText">List subscription · Gold layer updates</span>
                    <span className="homeRowChevron" aria-hidden>
                      ›
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
            <div className="homeCard">
              <h3 className="homeCardHeadTitle">My lists</h3>
              <ul className="homeSimpleList">
                {CURATED_LISTS.slice(0, 3).map((list) => (
                  <li key={list.id}>
                    <Link className="homeSimpleRow" to={curatedList(list.id)}>
                      <span className="homeSimpleRowText">Curated list · {list.title}</span>
                      <span className="homeRowChevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="homeSection" aria-labelledby="newupdated-heading">
          <h2 id="newupdated-heading" className="homeSectionTitle">
            New &amp; Updated
          </h2>
          <div className="homeTwoCol">
            <div className="homeCard">
              <div className="homeCardTabs" role="tablist" aria-label="New and deployed">
                {NEW_LEFT_TABS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={newLeftTab === i}
                    className={`homeCardTab ${newLeftTab === i ? 'homeCardTab--active' : ''}`}
                    onClick={() => setNewLeftTab(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ul className="homeSimpleList">
                {newProductItems.map((asset) => (
                  <li key={asset.id}>
                    <Link className="homeSimpleRow" to={assetDetail(asset.id)}>
                      <span className="homeSimpleRowText">
                        <span className="homeSimpleRowPrimary">New product · {asset.title}</span>
                        {asset.desc ? <span className="homeSimpleRowDesc">{asset.desc}</span> : null}
                      </span>
                      <span className="homeRowChevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="homeCard">
              <div className="homeCardTabs" role="tablist" aria-label="List updates">
                {NEW_RIGHT_TABS.map((label, i) => (
                  <button
                    key={label}
                    type="button"
                    role="tab"
                    aria-selected={newRightTab === i}
                    className={`homeCardTab ${newRightTab === i ? 'homeCardTab--active' : ''}`}
                    onClick={() => setNewRightTab(i)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <ul className="homeSimpleList">
                {CURATED_LISTS.slice(1, 4).map((list) => (
                  <li key={list.id}>
                    <Link className="homeSimpleRow" to={curatedList(list.id)}>
                      <span className="homeSimpleRowText">
                        <span className="homeSimpleRowPrimary">New list · {list.title}</span>
                        <span className="homeSimpleRowDesc">Updated {list.updated}</span>
                      </span>
                      <span className="homeRowChevron" aria-hidden>
                        ›
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

HomePage.propTypes = {};

export default HomePage;
