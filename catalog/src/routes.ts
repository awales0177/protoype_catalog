/**
 * Central route config. Replace this module to change URL structure (e.g. base path) in one place.
 */

import type { ProfileExperienceParams, ProfileExperienceTab, SearchRouteParams } from './types/catalog';

/** Design-system catalog area at `/catalog`. */
export const CATALOG_BASE = '/catalog';

/** Path segments for `<Route path={...}>` nested under the catalog layout route (`/catalog`). */
export const ROUTE_SEGMENTS = {
  search: 'search',
  asset: 'asset/:id',
  list: 'list/:id',
  profileExperience: 'profile/experience',
} as const;

export function home(): string {
  return CATALOG_BASE;
}

export function search(params: SearchRouteParams = {}): string {
  const { q = '', type = '', layer = '' } = params;
  const searchParams = new URLSearchParams();
  if (q) searchParams.set('q', q);
  if (type) searchParams.set('type', type);
  if (layer) searchParams.set('layer', layer);
  const query = searchParams.toString();
  return query ? `${CATALOG_BASE}/search?${query}` : `${CATALOG_BASE}/search`;
}

export function assetDetail(id: string | undefined | null): string {
  return `${CATALOG_BASE}/asset/${id ?? ''}`;
}

export function curatedList(id: string | undefined | null): string {
  return `${CATALOG_BASE}/list/${id ?? ''}`;
}

const PROFILE_TABS: ProfileExperienceTab[] = ['settings', 'subscriptions', 'transfers', 'other'];

function isProfileTab(tab: string): tab is ProfileExperienceTab {
  return (PROFILE_TABS as readonly string[]).includes(tab);
}

/** Full-page profile / experience management (query: tab = settings | subscriptions | transfers | other). */
export function profileExperience(params: ProfileExperienceParams = {}): string {
  const { tab = '' } = params;
  const t = tab && isProfileTab(tab) ? tab : '';
  return t ? `${CATALOG_BASE}/profile/experience?tab=${t}` : `${CATALOG_BASE}/profile/experience`;
}
