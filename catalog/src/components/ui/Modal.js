import PropTypes from 'prop-types';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import './Modal.css';

export function Modal({
  onClose,
  titleId,
  title,
  subtitle,
  children,
  footer,
  size = 'md',
  className,
  bodyClassName,
  flushBodyTop = false,
}) {
  useEscapeKey(true, onClose);

  return (
    <div
      className="uiModalBackdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className={['uiModalPanel', `uiModalPanel--${size}`, className].filter(Boolean).join(' ')}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="uiModalHeader">
          <div className="uiModalHeaderText">
            {typeof title === 'string' ? (
              <>
                {title ? (
                  <h2 id={titleId} className="uiModalTitle">
                    {title}
                  </h2>
                ) : null}
                {subtitle ? <p className="uiModalSubtitle">{subtitle}</p> : null}
              </>
            ) : (
              <>
                {title}
                {subtitle ? <p className="uiModalSubtitle">{subtitle}</p> : null}
              </>
            )}
          </div>
          <button type="button" className="uiModalClose" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div
          className={[
            'uiModalBody',
            flushBodyTop && 'uiModalBody--flushTop',
            bodyClassName,
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {children}
        </div>
        {footer && <div className="uiModalFooter">{footer}</div>}
      </div>
    </div>
  );
}

Modal.propTypes = {
  onClose: PropTypes.func.isRequired,
  titleId: PropTypes.string.isRequired,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.node,
  children: PropTypes.node,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  bodyClassName: PropTypes.string,
  flushBodyTop: PropTypes.bool,
};
