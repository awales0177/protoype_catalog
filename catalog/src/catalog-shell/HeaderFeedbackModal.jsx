import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { FeedbackOutlinedIcon, CheckIcon } from '../icons';
import { AnchoredPortalPanel } from './AnchoredPortalPanel';

const TOPICS = [
  { value: 'general', label: 'General feedback' },
  { value: 'search', label: 'Search & discovery' },
  { value: 'data', label: 'Data quality' },
  { value: 'ux', label: 'User experience' },
];

export function HeaderFeedbackModal({ submitFeedback, feedbackSubtitle, resolveUserId }) {
  const btnRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState('general');
  const [text, setText] = useState('');
  const [satisfaction, setSatisfaction] = useState(4);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const pct = `${((Number(satisfaction) - 1) / 9) * 100}%`;

  async function onSubmit(e) {
    e.preventDefault();
    const feedbackText = text.trim();
    if (!feedbackText) {
      setError('Please enter your feedback.');
      return;
    }
    if (typeof submitFeedback !== 'function') {
      setOpen(false);
      return;
    }
    setPending(true);
    setError('');
    let userId;
    try {
      userId = typeof resolveUserId === 'function' ? resolveUserId() : undefined;
    } catch {
      userId = undefined;
    }
    const composed = `[${topic}] Satisfaction: ${satisfaction}/10\n\n${feedbackText}`;
    try {
      await Promise.resolve(submitFeedback({ userId, feedbackText: composed }));
      setOpen(false);
      setText('');
      setTopic('general');
      setSatisfaction(4);
    } catch (err) {
      setError(err?.message || 'Could not send feedback.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="headerFeedbackWrap">
      <button
        ref={btnRef}
        type="button"
        className="catalogHeroIconBtn"
        aria-label="Send feedback"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FeedbackOutlinedIcon />
      </button>
      <AnchoredPortalPanel
        open={open}
        onClose={() => setOpen(false)}
        anchorRef={btnRef}
        className="headerFeedbackPanel headerFeedbackPanel--portal"
      >
        <form onSubmit={onSubmit}>
          <div className="headerFeedbackPanelHeader">
            <div className="headerFeedbackModalTitleBlock">
              <div className="headerFeedbackModalTitleRow">
                <h2 className="headerFeedbackModalTitle" id="header-feedback-title">
                  Send us feedback
                </h2>
                <span className="headerFeedbackModalTitleGlyph" aria-hidden>
                  <FeedbackOutlinedIcon />
                </span>
              </div>
            </div>
            <button type="button" className="headerFeedbackPanelClose" aria-label="Close" onClick={() => setOpen(false)}>
              ×
            </button>
          </div>
          {feedbackSubtitle ? <p className="headerFeedbackPanelIntro">{feedbackSubtitle}</p> : null}
          <div className="headerFeedbackPanelBody">
            {error ? (
              <p className="headerFeedbackError" role="alert">
                {error}
              </p>
            ) : null}
            <div className="headerFeedbackField">
              <label htmlFor="header-fb-topic" className="headerFeedbackLabel">
                Topic
              </label>
              <select
                id="header-fb-topic"
                className="headerFeedbackSelect"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              >
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="headerFeedbackField">
              <label htmlFor="header-fb-text" className="headerFeedbackLabel">
                Your feedback
              </label>
              <textarea
                id="header-fb-text"
                className="headerFeedbackTextarea"
                rows={5}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Tell us what worked well or what we should improve."
              />
            </div>
            <div className="headerFeedbackField headerFeedbackSatisfaction">
              <p className="headerFeedbackSatisfactionQuestion">How satisfied are you with this experience?</p>
              <input
                type="range"
                className="headerFeedbackRange"
                style={{ '--feedback-range-pct': pct }}
                min={1}
                max={10}
                step={1}
                value={satisfaction}
                onChange={(e) => setSatisfaction(Number(e.target.value))}
                aria-valuemin={1}
                aria-valuemax={10}
                aria-valuenow={satisfaction}
              />
              <div className="headerFeedbackRangeLabels">
                <span>Not satisfied</span>
                <span>Very satisfied</span>
              </div>
            </div>
          </div>
          <div className="headerFeedbackPanelFooter">
            <div className="headerFeedbackModalFooterInner">
              <button type="submit" className="headerFeedbackSubmit" disabled={pending}>
                <span className="headerFeedbackSubmitIcon" aria-hidden>
                  <CheckIcon />
                </span>
                Submit feedback
              </button>
            </div>
          </div>
        </form>
      </AnchoredPortalPanel>
    </div>
  );
}

HeaderFeedbackModal.propTypes = {
  submitFeedback: PropTypes.func,
  feedbackSubtitle: PropTypes.string,
  resolveUserId: PropTypes.func,
};
