/** Profile tabs for full-page experience management (`/catalog/profile/experience?tab=…`). */
export type ProfileExperienceTab = 'settings' | 'subscriptions' | 'other';

export type SearchRouteParams = {
  q?: string;
  type?: string;
  layer?: string;
};

export type ProfileExperienceParams = {
  tab?: string;
};

/**
 * Normalized asset used in `ASSETS_BY_ID`, relationship helpers, and asset pages.
 * (Aligned with `toDetailAsset` / `getAssetById` in `data/assets`.)
 */
export interface CatalogAssetDetail {
  id: string;
  name: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  feed: boolean;
  stale: boolean;
  noDataAccess: boolean;
  trackerFailedStepId: string | null;
  parentId: string | null;
}

export interface CuratedList {
  id: string;
  title: string;
  description?: string;
  assetIds: string[];
  owner?: string;
  updated?: string;
  visibility?: string;
  curators?: string[];
}
