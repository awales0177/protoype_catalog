import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import PropTypes from 'prop-types';
import MermaidDiagram from '../MermaidDiagram';

function ReadmeTab({ content = '' }) {
  return (
    <div className="assetContentLayout">
      <div className="assetContentArea">
        <div className="assetSection readmeSection">
          <div className="overviewReadme">
            {!content.trim() ? (
              <p className="assetFieldValue">No README content.</p>
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
                    return <code className={className} {...props}>{children}</code>;
                  },
                }}
              >
                {content}
              </ReactMarkdown>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ReadmeTab.propTypes = {
  content: PropTypes.string,
};

export default ReadmeTab;
