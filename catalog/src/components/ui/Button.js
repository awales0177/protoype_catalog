import PropTypes from 'prop-types';
import './Button.css';

export function Button({ variant = 'secondary', className, children, type = 'button', ...rest }) {
  return (
    <button type={type} className={['uiBtn', `uiBtn--${variant}`, className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
  children: PropTypes.node,
};
