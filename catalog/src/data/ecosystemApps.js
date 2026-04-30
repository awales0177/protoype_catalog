/**
 * Links shown in the header “more apps” launcher.
 * Override origins with `REACT_APP_UUX_CATALOG_ORIGIN`, `REACT_APP_UUX_APP4_ORIGIN`,
 * `REACT_APP_UUX_APP5_ORIGIN`, `REACT_APP_UUX_APP7_ORIGIN` (no trailing slash).
 */

function readReactEnv(key) {
  const v = process.env[key];
  return typeof v === 'string' ? v.trim() : '';
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
    href: withTrailingSlash(readReactEnv('REACT_APP_UUX_CATALOG_ORIGIN') || CATALOG_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'catalog',
  },
  {
    id: 'app4',
    name: 'UUIDs',
    description: 'Identifier registry, resolution, and lineage',
    href: withTrailingSlash(readReactEnv('REACT_APP_UUX_APP4_ORIGIN') || APP4_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'app4',
  },
  {
    id: 'app5',
    name: 'Data Lake',
    description: 'Lake zones, volumes, and storage paths',
    href: withTrailingSlash(readReactEnv('REACT_APP_UUX_APP5_ORIGIN') || APP5_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'app5',
  },
  {
    id: 'app7',
    name: 'Search and discovery',
    description: 'Unified search, facets, and relevance across the catalog',
    href: withTrailingSlash(readReactEnv('REACT_APP_UUX_APP7_ORIGIN') || APP7_ORIGIN_FALLBACK),
    external: true,
    sameWindow: true,
    icon: 'app7',
  },
];
