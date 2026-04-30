import { Link } from 'react-router-dom';
import { curatedList } from '../../routes';
import PropTypes from 'prop-types';

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </svg>
  );
}

function formatListDate(iso) {
  if (!iso) return '—';
  const d = new Date(`${iso}T12:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const y = d.getFullYear();
  return `${m}/${day}/${y}`;
}

function AssetCuratedListsCard({ lists }) {
  return (
    <section className="assetCuratedListsCard" aria-labelledby="asset-curated-lists-heading">
      <div className="assetCuratedListsHead">
        <h2 id="asset-curated-lists-heading" className="assetCuratedListsTitle">
          Curated Lists
        </h2>
        <span className="assetCuratedListsInfo" aria-hidden>
          <InfoIcon />
        </span>
      </div>
      <ul className="assetCuratedListsList">
        {lists.map((list) => (
          <li key={list.id}>
            <Link to={curatedList(list.id)} className="assetCuratedListsRow">
              <span className="assetCuratedListsRowMain">
                <span className="assetCuratedListsName">{list.title}</span>
                <span className="assetCuratedListsUpdated">Last Updated: {formatListDate(list.updated)}</span>
              </span>
              <span className="assetCuratedListsChev" aria-hidden>
                {'\u203a'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

AssetCuratedListsCard.propTypes = {
  lists: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      updated: PropTypes.string,
    })
  ).isRequired,
};

export default AssetCuratedListsCard;
