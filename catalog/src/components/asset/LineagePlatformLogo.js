import PropTypes from 'prop-types';
import { publicAssetUrl } from '../../utils/publicAssetUrl';

/** Brand marks shipped in `/public` (see `public/s3.png`, etc.). */
const PUBLIC_LOGO_FILES = {
  s3: 's3.png',
  kubeflow: 'kubeflow.png',
  jupyter: 'Jupyter_logo.png',
  spark: 'Apache_Spark_logo.svg.png',
};

function publicLogoSrc(logoId) {
  const file = PUBLIC_LOGO_FILES[logoId];
  if (!file) return null;
  return publicAssetUrl(file);
}

const LOGO_SVGS = {
  snowflake: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <g fill="none" stroke="#29B5E8" strokeWidth="1.8" strokeLinecap="round">
        <path d="M12 3v18M5 6l14 12M19 6L5 18" />
        <circle cx="12" cy="12" r="2.5" fill="#29B5E8" stroke="none" />
      </g>
    </svg>
  ),
  databricks: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#FF3621" d="M12 4l7 4v8l-7 4-7-4V8l7-4z" opacity="0.25" />
      <path fill="#FF3621" d="M12 4v8l-7-4V8l7-4zm0 8l7-4v4l-7 4V12zm0 0v8l7-4v-4l-7 4zm0 0l-7-4v4l7 4v-8z" />
    </svg>
  ),
  kubernetes: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#326CE5"
        d="M12 2l2.2 6.8h6.8l-5.5 4 2.1 6.7L12 15.8l-5.6 3.7 2.1-6.7-5.5-4h6.8L12 2z"
      />
    </svg>
  ),
  sklearn: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="8" cy="8" r="3" fill="#F89939" />
      <circle cx="16" cy="10" r="2.5" fill="#3499cd" />
      <path fill="#7cb342" d="M6 18c2-3 5-4 8-3l-1 2c-2-.8-4 0-5 2l-2-1z" />
    </svg>
  ),
  warehouse: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#6366f1"
        d="M4 8h16v10H4V8zm2 2v6h12v-6H6zm2 2h8v2H8v-2zm-4-6l8-3 8 3v2H4V6z"
      />
    </svg>
  ),
  delta: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#00ADD4" d="M12 2L4 20h16L12 2zm0 4l5.5 12h-11L12 6z" />
    </svg>
  ),
  validation: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="#ecfdf3" stroke="#22c55e" strokeWidth="1.5" />
      <path
        fill="none"
        stroke="#15803d"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8 12l2.5 2.5L16 9"
      />
    </svg>
  ),
  scan: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <circle cx="12" cy="12" r="9" fill="none" stroke="#64748b" strokeWidth="1.5" opacity="0.35" />
      <path fill="none" stroke="#2563eb" strokeWidth="1.75" strokeLinecap="round" d="M12 12l6-6M12 12l5 7M12 12l-9 3" />
      <circle cx="12" cy="12" r="2.25" fill="#2563eb" />
    </svg>
  ),
  condition: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path
        fill="none"
        stroke="#7c3aed"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 10h6l2 8 2-16 2 8h6"
      />
    </svg>
  ),
  write: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <path fill="#0ea5e9" d="M6 4h11l3 3v13a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2z" opacity="0.2" />
      <path
        fill="none"
        stroke="#0369a1"
        strokeWidth="1.6"
        strokeLinejoin="round"
        d="M6 4h9v4h4v11a1 1 0 01-1 1H6a1 1 0 01-1-1V5a1 1 0 011-1z"
      />
      <path fill="#0369a1" d="M15 4v3h3" opacity="0.9" />
      <path stroke="#0369a1" strokeWidth="1.4" strokeLinecap="round" d="M8 14h8M8 17h6" />
    </svg>
  ),
  default: (
    <svg viewBox="0 0 24 24" aria-hidden>
      <rect x="4" y="4" width="16" height="16" rx="3" fill="#64748b" opacity="0.85" />
      <path fill="#fff" d="M7 8h10v2H7V8zm0 4h6v2H7v-2z" />
    </svg>
  ),
};

function LineagePlatformLogo({ logoId, label, variant }) {
  const cls = ['lineagePlatformLogo', variant === 'chip' && 'lineagePlatformLogo--chip'].filter(Boolean).join(' ');
  const imgSrc = publicLogoSrc(logoId);

  if (imgSrc) {
    return (
      <span className={cls} title={label || undefined}>
        <img src={imgSrc} alt="" className="lineagePlatformLogoImg" width={24} height={24} decoding="async" />
      </span>
    );
  }

  const svg = LOGO_SVGS[logoId] || LOGO_SVGS.default;
  return (
    <span className={cls} title={label || undefined} aria-hidden>
      {svg}
    </span>
  );
}

LineagePlatformLogo.propTypes = {
  logoId: PropTypes.string,
  label: PropTypes.string,
  variant: PropTypes.oneOf(['default', 'chip']),
};

LineagePlatformLogo.defaultProps = {
  logoId: 'default',
  label: '',
  variant: 'default',
};

export default LineagePlatformLogo;
