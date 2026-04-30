import { useState, useCallback } from 'react';
import { FileIcon, CopyIcon, CheckIcon } from '../../icons';
import PropTypes from 'prop-types';
import { ASSET_OVERVIEW_DEFAULTS } from '../../data/sample_data';

function AssetDetails({
  asset,
  assetId,
  summarySection,
  setSummarySection,
  comments,
  newCommentText,
  setNewCommentText,
  postComment,
  isDataProductType,
  attachments = [],
  historyLogs = [],
  variant = 'default',
}) {
  const s3Path = `${ASSET_OVERVIEW_DEFAULTS.s3LocationBase}/${assetId}/`;
  const [copied, setCopied] = useState(false);
  const copyS3Path = useCallback(() => {
    navigator.clipboard.writeText(s3Path).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [s3Path]);

  if (variant === 'recordComments') {
    return (
      <div className="assetContentLayout assetContentLayout--recordEmbed">
        <div className="assetContentArea">
          <h3 className="assetSectionTitle">Comments</h3>
          <p className="assetSectionDesc">Discuss this record with your team.</p>
          <div className="assetCommentsList">
            {comments.map((c) => (
              <article key={c.id} className="assetCommentCard">
                <div className="assetCommentMeta">
                  <span className="assetCommentAvatar" aria-hidden>
                    {c.authorInitials}
                  </span>
                  <div className="assetCommentMetaText">
                    <span className="assetCommentAuthor">{c.author}</span>
                    <time className="assetCommentTime" dateTime={`${c.date} ${c.time}`}>
                      {c.date} at {c.time}
                    </time>
                  </div>
                </div>
                <p className="assetCommentBody">{c.body}</p>
              </article>
            ))}
          </div>
          <div className="assetCommentForm">
            <label htmlFor="asset-new-comment-record" className="assetCommentFormLabel">
              Add a comment
            </label>
            <textarea
              id="asset-new-comment-record"
              className="assetCommentTextarea"
              placeholder="Write a comment..."
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              rows={3}
              aria-label="New comment"
            />
            <button type="button" className="assetCommentSubmit" onClick={postComment} disabled={!newCommentText.trim()}>
              Post comment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="assetContentLayout">
      <nav className="assetSubNav" aria-label="Details">
        <button type="button" className={`assetSubNavItem ${summarySection === 'overview' ? 'active' : ''}`} onClick={() => setSummarySection('overview')}>Overview</button>
        <button type="button" className={`assetSubNavItem ${summarySection === 'history' ? 'active' : ''}`} onClick={() => setSummarySection('history')}>History</button>
        <button type="button" className={`assetSubNavItem ${summarySection === 'comments' ? 'active' : ''}`} onClick={() => setSummarySection('comments')}>Comments</button>
        <button type="button" className={`assetSubNavItem ${summarySection === 'attachments' ? 'active' : ''}`} onClick={() => setSummarySection('attachments')}>Attachments ({attachments.length})</button>
      </nav>
      <div className="assetContentArea">
        {summarySection === 'overview' && (
          <div className="overviewCatalog">
            <div className="overviewCatalogHeader">
              <h3 className="overviewCatalogTitle">Key information</h3>
              <label className="assetToggle overviewCatalogToggle">
                <input type="checkbox" defaultChecked className="assetToggleInput" aria-label="Hide empty values" />
                <span className="assetToggleSwitch" aria-hidden>
                  <span className="assetToggleThumb" />
                </span>
                <span className="assetToggleLabel">Hide empty values</span>
              </label>
            </div>
            <div className="overviewMetaGrid">
              <div className="overviewMetaRow">
                <span className="overviewMetaKey">Owner</span>
                <span className="overviewMetaValue"><a href={ASSET_OVERVIEW_DEFAULTS.ownerHref}>{ASSET_OVERVIEW_DEFAULTS.owner}</a></span>
              </div>
              <div className="overviewMetaRow">
                <span className="overviewMetaKey">Last updated</span>
                <span className="overviewMetaValue">{ASSET_OVERVIEW_DEFAULTS.lastUpdated}</span>
              </div>
              <div className="overviewMetaRow">
                <span className="overviewMetaKey">Type</span>
                <span className="overviewMetaValue">
                  {asset.type}
                  {asset.feed && <span className="overviewFeedBadge">Feed</span>}
                </span>
              </div>
              <div className="overviewMetaRow">
                <span className="overviewMetaKey">Status</span>
                <span className="overviewMetaValue"><span className="overviewStatusPill approved">{ASSET_OVERVIEW_DEFAULTS.status}</span></span>
              </div>
              <div className="overviewMetaRow">
                <span className="overviewMetaKey">Source system</span>
                <span className="overviewMetaValue">{ASSET_OVERVIEW_DEFAULTS.sourceSystem}</span>
              </div>
            </div>
            <div className="overviewBlock">
              <h4 className="overviewBlockTitle">Description</h4>
              <p className="overviewBlockText">{asset.description}</p>
            </div>
            {isDataProductType && (
              <>
                <div className="overviewBlock">
                  <h4 className="overviewBlockTitle">Product scores</h4>
                  <div className="overviewProductScores">
                    {ASSET_OVERVIEW_DEFAULTS.productScores.map(({ label, value }) => (
                      <div key={label} className="overviewScoreItem">
                        <div className="overviewScoreRow">
                          <span className="overviewScoreLabel">{label}</span>
                          <span className="overviewScoreValue">{value}%</span>
                        </div>
                        <div className="overviewScoreBar" role="presentation" aria-hidden>
                          <div
                            className={`overviewScoreBarFill overviewScoreBarFill--${value >= 80 ? 'good' : value >= 50 ? 'medium' : 'low'}`}
                            style={{ width: `${value}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="overviewBlock">
                  <h4 className="overviewBlockTitle">Storage & volume</h4>
                  <div className="overviewS3CopyBox">
                    <label className="overviewS3CopyLabel">S3 Location</label>
                    <div className="overviewS3CopyInner">
                      <code className="overviewS3CopyPath">{s3Path}</code>
                      <button
                        type="button"
                        className="overviewS3CopyBtn"
                        onClick={copyS3Path}
                        aria-label={copied ? 'Copied' : 'Copy S3 path'}
                        title={copied ? 'Copied' : 'Copy'}
                      >
                        {copied ? <CheckIcon /> : <CopyIcon />}
                      </button>
                    </div>
                  </div>
                  <div className="overviewMetaGrid">
                    <div className="overviewMetaRow">
                      <span className="overviewMetaKey">Data volume (last 30 days)</span>
                      <span className="overviewMetaValue">{ASSET_OVERVIEW_DEFAULTS.dataVolumeLast30Days}</span>
                    </div>
                  </div>
                </div>
                <div className="overviewBlock">
                  <h4 className="overviewBlockTitle">Links</h4>
                  <div className="overviewLinkCards">
                    {ASSET_OVERVIEW_DEFAULTS.overviewLinkCards.map(({ title, desc, href }) => (
                      <a key={href} href={href} className="overviewLinkCard">
                        <span className="overviewLinkCardTitle">{title}</span>
                        <span className="overviewLinkCardDesc">{desc}</span>
                        <span className="overviewLinkCardArrow">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
        {summarySection === 'history' && (
          <>
            <h3 className="assetSectionTitle">Change history</h3>
            <p className="assetSectionDesc">Log of changes made to this record.</p>
            <ul className="assetHistoryList" aria-label="Change history">
              {historyLogs.map((log) => (
                <li key={log.id} className="assetHistoryItem">
                  <div className="assetHistoryMarker" aria-hidden />
                  <div className="assetHistoryCard">
                    <div className="assetHistoryMeta">
                      <span className="assetHistoryUserAvatar" aria-hidden>{log.userInitials}</span>
                      <div className="assetHistoryMetaText">
                        <span className="assetHistoryUser">{log.user}</span>
                        <span className="assetHistoryAction">{log.action}</span>
                        <time className="assetHistoryTime" dateTime={`${log.date}T${log.time}`}>{log.date} at {log.time}</time>
                      </div>
                    </div>
                    <div className="assetHistoryChanges">
                      {log.changes.map((c) => (
                        <div key={c.id} className="assetHistoryChangeRow">
                          <span className="assetHistoryChangeField">{c.field}</span>
                          {c.oldValue != null && c.oldValue !== '' && (
                            <span className="assetHistoryChangeOld">"{c.oldValue}" → </span>
                          )}
                          <span className="assetHistoryChangeNew">"{c.newValue}"</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {summarySection === 'comments' && (
          <>
            <h3 className="assetSectionTitle">Comments</h3>
            <p className="assetSectionDesc">Discuss this record with your team.</p>
            <div className="assetCommentsList">
              {comments.map((c) => (
                <article key={c.id} className="assetCommentCard">
                  <div className="assetCommentMeta">
                    <span className="assetCommentAvatar" aria-hidden>{c.authorInitials}</span>
                    <div className="assetCommentMetaText">
                      <span className="assetCommentAuthor">{c.author}</span>
                      <time className="assetCommentTime" dateTime={`${c.date} ${c.time}`}>{c.date} at {c.time}</time>
                    </div>
                  </div>
                  <p className="assetCommentBody">{c.body}</p>
                </article>
              ))}
            </div>
            <div className="assetCommentForm">
              <label htmlFor="asset-new-comment" className="assetCommentFormLabel">Add a comment</label>
              <textarea
                id="asset-new-comment"
                className="assetCommentTextarea"
                placeholder="Write a comment..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={3}
                aria-label="New comment"
              />
              <button type="button" className="assetCommentSubmit" onClick={postComment} disabled={!newCommentText.trim()}>
                Post comment
              </button>
            </div>
          </>
        )}
        {summarySection === 'attachments' && (
          <>
            <div className="assetAttachmentsHeader">
              <div>
                <h3 className="assetSectionTitle">Attachments</h3>
                <p className="assetSectionDesc">Files and documents linked to this record.</p>
              </div>
              <button type="button" className="assetAttachmentUploadBtn">Upload file</button>
            </div>
            <div className="assetAttachmentsTableWrap">
              <table className="assetAttachmentsTable">
                <thead>
                  <tr>
                    <th scope="col" className="assetAttachmentsColName">Name</th>
                    <th scope="col" className="assetAttachmentsColSize">Size</th>
                    <th scope="col" className="assetAttachmentsColDate">Date added</th>
                    <th scope="col" className="assetAttachmentsColBy">Uploaded by</th>
                    <th scope="col" className="assetAttachmentsColAction" aria-label="Actions" />
                  </tr>
                </thead>
                <tbody>
                  {attachments.map((att) => (
                    <tr key={att.id}>
                      <td className="assetAttachmentsColName">
                        <span className="assetAttachmentIcon" aria-hidden><FileIcon /></span>
                        <a href="#attachment" className="assetAttachmentName">{att.name}</a>
                      </td>
                      <td className="assetAttachmentsColSize">{att.size}</td>
                      <td className="assetAttachmentsColDate">{att.date}</td>
                      <td className="assetAttachmentsColBy">{att.uploadedBy}</td>
                      <td className="assetAttachmentsColAction">
                        <button type="button" className="assetAttachmentDownload" aria-label={`Download ${att.name}`} title="Download">↓</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

AssetDetails.propTypes = {
  asset: PropTypes.object.isRequired,
  assetId: PropTypes.string.isRequired,
  summarySection: PropTypes.oneOf(['overview', 'history', 'comments', 'attachments']).isRequired,
  setSummarySection: PropTypes.func.isRequired,
  comments: PropTypes.arrayOf(PropTypes.object).isRequired,
  newCommentText: PropTypes.string.isRequired,
  setNewCommentText: PropTypes.func.isRequired,
  postComment: PropTypes.func.isRequired,
  isDataProductType: PropTypes.bool.isRequired,
  attachments: PropTypes.arrayOf(PropTypes.object),
  historyLogs: PropTypes.arrayOf(PropTypes.object),
  variant: PropTypes.oneOf(['default', 'recordComments']),
};

AssetDetails.defaultProps = {
  variant: 'default',
};

export default AssetDetails;
