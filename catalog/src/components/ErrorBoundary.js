import { Component } from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const { fallback } = this.props;
      if (typeof fallback === 'function') return fallback(this.state.error);
      if (fallback) return fallback;
      const err = this.state.error;
      const isDev = process.env.NODE_ENV !== 'production';
      return (
        <div className="errorBoundary" role="alert">
          <h2>Something went wrong</h2>
          <p>We’ve been notified and are looking into it. Try refreshing the page.</p>
          {isDev && err && (
            <pre className="errorBoundaryDetails">
              {err.message}
              {err.stack ? `\n\n${err.stack}` : ''}
            </pre>
          )}
          <button type="button" onClick={() => this.setState({ hasError: false, error: null })}>
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
};

export default ErrorBoundary;
