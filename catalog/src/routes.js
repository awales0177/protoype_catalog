/**
 * Central route config. Replace this module to change URL structure (e.g. base path) in one place.
 */

/** Design-system catalog area at `/catalog`. */
export const CATALOG_BASE = '/catalog';

/** Path segments for `<Route path={...}>` nested under the catalog layout route (`/catalog`). */
export const ROUTE_SEGMENTS = {
  search: 'search',
  asset: 'asset/:id',
  list: 'list/:id',
  profileExperience: 'profile/experience',
};

export function home() {
  return CATALOG_BASE;
}

export function search(params = {}) {
  const { q = '', type = '', layer = '' } = params;
  const searchParams = new URLSearchParams();
  if (q) searchParams.set('q', q);
  if (type) searchParams.set('type', type);
  if (layer) searchParams.set('layer', layer);
  const query = searchParams.toString();
  return query ? `${CATALOG_BASE}/search?${query}` : `${CATALOG_BASE}/search`;
}

export function assetDetail(id) {
  return `${CATALOG_BASE}/asset/${id || ''}`;
}

export function curatedList(id) {
  return `${CATALOG_BASE}/list/${id || ''}`;
}

/** Full-page profile / experience management (query: tab = settings | subscriptions | transfers | other). */
export function profileExperience(params = {}) {
  const { tab = '' } = params;
  const allowed = ['settings', 'subscriptions', 'transfers', 'other'];
  const t = allowed.includes(tab) ? tab : '';
  return t ? `${CATALOG_BASE}/profile/experience?tab=${t}` : `${CATALOG_BASE}/profile/experience`;
}
