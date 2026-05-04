import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import MermaidDiagram from '../MermaidDiagram';
import ProductModelInfoCard from './ProductModelInfoCard';
import ProductAgreementCard from './ProductAgreementCard';
import './ModelDetailsTab.css';

function ModelDetailsTab({ readmeContent = '', modelInfo, productAgreement }) {
  return (
    <div className="assetContentLayout">
      <div className="assetContentArea">
        <div className="modelDetailsTabPanels">
          <div className="modelDetailsCardRow">
            {modelInfo ? <ProductModelInfoCard info={modelInfo} /> : null}
            {productAgreement ? <ProductAgreementCard agreement={productAgreement} /> : null}
          </div>

          <div className="assetSection readmeSection modelDetailsMarkdownWrap">
            <div className="overviewReadme">
              {!readmeContent.trim() ? (
                <p className="assetFieldValue">No documentation yet.</p>
              ) : (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code: ({ node, inline, className, children, ...props }) => {
                      const isMermaid = !inline && className?.includes('language-mermaid');
                      if (isMermaid) {
                        const code = Array.isArray(children) ? children.join('') : String(children ?? '');
                        return <MermaidDiagram code={code.replace(/\n$/, '')} />;
                      }
                      return (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      );
                    },
                  }}
                >
                  {readmeContent}
                </ReactMarkdown>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const modelInfoProp = PropTypes.shape({
  logicalLabel: PropTypes.string,
  logicalName: PropTypes.string,
  version: PropTypes.string,
  format: PropTypes.string,
  encoding: PropTypes.string,
  rowCardinality: PropTypes.string,
  domain: PropTypes.string,
  owner: PropTypes.string,
  updateFrequency: PropTypes.string,
  notes: PropTypes.string,
});

const groupEntryProp = PropTypes.oneOfType([
  PropTypes.string,
  PropTypes.shape({ name: PropTypes.string.isRequired }),
]);

const agreementProp = PropTypes.shape({
  title: PropTypes.string,
  maturityLine: PropTypes.string,
  stewardLine: PropTypes.string,
  effectiveDate: PropTypes.string,
  providers: PropTypes.arrayOf(groupEntryProp),
  producers: PropTypes.arrayOf(groupEntryProp),
  consumers: PropTypes.arrayOf(groupEntryProp),
});

ModelDetailsTab.propTypes = {
  readmeContent: PropTypes.string,
  modelInfo: modelInfoProp,
  productAgreement: agreementProp,
};

ModelDetailsTab.defaultProps = {
  readmeContent: '',
  modelInfo: null,
  productAgreement: null,
};

export default ModelDetailsTab;
