import { useReducer, useState } from 'react';
import PropTypes from 'prop-types';

const RECORD_VOTE_INITIAL = { feedback: null, up: 2847, down: 132 };

function recordVoteReducer(state, action) {
  switch (action.type) {
    case 'toggleUp':
      if (state.feedback === 'up') return { ...state, feedback: null, up: state.up - 1 };
      if (state.feedback === 'down') return { ...state, feedback: 'up', up: state.up + 1, down: state.down - 1 };
      return { ...state, feedback: 'up', up: state.up + 1 };
    case 'toggleDown':
      if (state.feedback === 'down') return { ...state, feedback: null, down: state.down - 1 };
      if (state.feedback === 'up') return { ...state, feedback: 'down', down: state.down + 1, up: state.up - 1 };
      return { ...state, feedback: 'down', down: state.down + 1 };
    default:
      return state;
  }
}

function formatVoteCount(n) {
  return Math.max(0, n).toLocaleString('en-US');
}

function ThumbsUpIcon({ className = undefined }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11v-9h-4z" />
      <path d="M7 22V11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2z" />
    </svg>
  );
}

function ThumbsDownIcon({ className = undefined }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H6v9h4z" />
      <path d="M18 2v13h2a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2z" />
    </svg>
  );
}

function FlagIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M4 22V4l4-1v15" />
      <path d="M12 3l10-2v9l-10 2" />
    </svg>
  );
}

function ChatBubbleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function AssetProjectValueCard({ variant = 'default' }) {
  const [feedback, setFeedback] = useState(null);
  const [recordVotes, dispatchRecordVote] = useReducer(recordVoteReducer, RECORD_VOTE_INITIAL);
  const record = variant === 'record';

  if (record) {
    const { feedback: rv, up: upCount, down: downCount } = recordVotes;
    return (
      <section className="assetProjectValueCard assetProjectValueCard--record" aria-labelledby="project-value-heading">
        <div className="assetProjectValueRecordTop">
          <h2 id="project-value-heading" className="assetProjectValueRecordHeading">
            Is this data useful?
          </h2>
        </div>

        <div className="assetProjectValueRecordFooter">
          <div className="assetProjectValueRecordFooterRow">
            <button
              type="button"
              className="assetProjectValueLeaveComment"
              onClick={() =>
                document.getElementById('asset-record-comments')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
            >
              <ChatBubbleIcon />
              Comment
            </button>
            <div className="assetProjectValueVoteSubtle" role="group" aria-label="Community votes">
              <button
                type="button"
                className={`assetProjectValueVoteGhost ${rv === 'up' ? 'assetProjectValueVoteGhost--active' : ''}`}
                onClick={() => dispatchRecordVote({ type: 'toggleUp' })}
                aria-pressed={rv === 'up'}
                aria-label={`Useful, ${formatVoteCount(upCount)} votes`}
              >
                <ThumbsUpIcon className="assetProjectValueVoteGhostIcon" />
                <span className="assetProjectValueVoteGhostCount">{formatVoteCount(upCount)}</span>
              </button>
              <button
                type="button"
                className={`assetProjectValueVoteGhost ${rv === 'down' ? 'assetProjectValueVoteGhost--active' : ''}`}
                onClick={() => dispatchRecordVote({ type: 'toggleDown' })}
                aria-pressed={rv === 'down'}
                aria-label={`Not useful, ${formatVoteCount(downCount)} votes`}
              >
                <ThumbsDownIcon className="assetProjectValueVoteGhostIcon" />
                <span className="assetProjectValueVoteGhostCount">{formatVoteCount(downCount)}</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="assetProjectValueCard" aria-labelledby="project-value-heading-default">
      <h2 id="project-value-heading-default" className="assetProjectValueTitle">
        Project value
      </h2>
      <p className="assetProjectValueText">If this product or set was helpful to your goals, please let us know!</p>
      <div className="assetProjectValueActions" role="group" aria-label="Tell us if this was helpful">
        <button
          type="button"
          className={`assetProjectValueBtn ${feedback === 'up' ? 'assetProjectValueBtn--active' : ''}`}
          onClick={() => setFeedback((f) => (f === 'up' ? null : 'up'))}
          aria-pressed={feedback === 'up'}
          aria-label="This was helpful"
        >
          <ThumbsUpIcon />
        </button>
        <button
          type="button"
          className={`assetProjectValueBtn ${feedback === 'down' ? 'assetProjectValueBtn--active' : ''}`}
          onClick={() => setFeedback((f) => (f === 'down' ? null : 'down'))}
          aria-pressed={feedback === 'down'}
          aria-label="This was not helpful"
        >
          <ThumbsDownIcon />
        </button>
        <button
          type="button"
          className={`assetProjectValueBtn ${feedback === 'flag' ? 'assetProjectValueBtn--active' : ''}`}
          onClick={() => setFeedback((f) => (f === 'flag' ? null : 'flag'))}
          aria-pressed={feedback === 'flag'}
          aria-label="Flag an issue"
        >
          <FlagIcon />
        </button>
      </div>
    </section>
  );
}

AssetProjectValueCard.propTypes = {
  variant: PropTypes.oneOf(['default', 'record']),
};

AssetProjectValueCard.defaultProps = {
  variant: 'default',
};

export default AssetProjectValueCard;
