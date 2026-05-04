import PropTypes from 'prop-types';

const groupProp = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({ name: PropTypes.string.isRequired }),
]);

/** @param {(string | { name: string })[]} raw */
function normalizeGroups(raw) {
  if (!raw || !Array.isArray(raw)) return [];
  return raw
    .map((entry) => (typeof entry === 'string' ? { name: entry } : entry))
    .filter((g) => g && typeof g.name === 'string' && g.name.trim().length > 0);
}

function ProductAgreementCard({ agreement }) {
  if (!agreement) return null;

  const { title, maturityLine, stewardLine, effectiveDate, providers, producers, consumers } = agreement;

  const sections = [
    ['Providers', normalizeGroups(providers)],
    ['Producers', normalizeGroups(producers)],
    ['Consumers', normalizeGroups(consumers)],
  ].filter(([, groups]) => groups.length > 0);

  return (
    <section id="product-agreement" className="productDetailCard productAgreementCard">
      <h3 className="productDetailCardTitle">{title || 'Product agreement'}</h3>
      {maturityLine ? <p className="productDetailCardLead">{maturityLine}</p> : null}
      {(stewardLine || effectiveDate) && (
        <p className="productDetailCardMuted">
          {[stewardLine, effectiveDate ? `Effective ${effectiveDate}` : null].filter(Boolean).join(' · ')}
        </p>
      )}
      <div className="productAgreementSections">
        {sections.map(([heading, groups]) => (
          <div key={heading} className="productAgreementSection">
            <h4 className="productAgreementSectionHeading">{heading}</h4>
            <ul className="productAgreementGroupList" aria-label={`${heading} groups`}>
              {groups.map((g, idx) => (
                <li key={`${heading}-${idx}-${g.name}`} className="productAgreementGroupItem">
                  {g.name}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

ProductAgreementCard.propTypes = {
  agreement: PropTypes.shape({
    title: PropTypes.string,
    maturityLine: PropTypes.string,
    stewardLine: PropTypes.string,
    effectiveDate: PropTypes.string,
    providers: PropTypes.arrayOf(groupProp),
    producers: PropTypes.arrayOf(groupProp),
    consumers: PropTypes.arrayOf(groupProp),
  }),
};

ProductAgreementCard.defaultProps = {
  agreement: null,
};

export default ProductAgreementCard;
