/**
 * Links shown in the header “more apps” launcher.
 * `icon`: key mapped in EcosystemAppsMenu · `sameWindow`: full URL opens in this tab.
 * `publicLogoPath`: file under that app’s `public/` (same as catalog `publicAssetUrl(...)`);
 *   resolved against `href` so the image loads when the menu runs on another origin.
 *
 * Origins default to local dev ports. Override in the consuming app via Vite env:
 *   VITE_UUX_CATALOG_ORIGIN, VITE_UUX_APP4_ORIGIN,
 *   VITE_UUX_APP5_ORIGIN, VITE_UUX_APP7_ORIGIN (no trailing slash required).
 */
function readEnvString(key) {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && typeof import.meta.env[key] === 'string') {
      const v = import.meta.env[key].trim();
      if (v) return v;
    }
  } catch {
    /* import.meta unavailable */
  }
  if (typeof process !== 'undefined' && process.env && typeof process.env[key] === 'string') {
    const v = process.env[key].trim();
    if (v) return v;
  }
  return '';
}

function withTrailingSlash(url) {
  const s = String(url || '').trim();
  if (!s) return '/';
  return s.endsWith('/') ? s : `${s}/`;
}

const CATALOG_ORIGIN_FALLBACK = 'http://localhost:3000';
const APP4_ORIGIN_FALLBACK = 'http://localhost:3003';
const APP5_ORIGIN_FALLBACK = 'http://localhost:3004';
const APP7_ORIGIN_FALLBACK = 'http://localhost:3006';

export const ECOSYSTEM_APPS = [
  {
    id: 'catalog',
    name: 'Catalog',
    description: 'Search, discover, and manage data products',
    href: withTrailingSlash(readEnvString('VITE_UUX_CATALOG_ORIGIN') || CATALOG_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'catalog',
  },
  {
    id: 'app4',
    name: 'UUIDs',
    description: 'Identifier registry, resolution, and lineage',
    href: withTrailingSlash(readEnvString('VITE_UUX_APP4_ORIGIN') || APP4_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'app4',
  },
  {
    id: 'app5',
    name: 'Data Lake',
    description: 'Lake zones, volumes, and storage paths',
    href: withTrailingSlash(readEnvString('VITE_UUX_APP5_ORIGIN') || APP5_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'app5',
  },
  {
    id: 'app7',
    name: 'Search and discovery',
    description: 'Unified search, facets, and relevance across the catalog',
    href: withTrailingSlash(readEnvString('VITE_UUX_APP7_ORIGIN') || APP7_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'app7',
  },
];
