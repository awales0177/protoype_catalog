/**
 * Catalog data access layer. Today backed by static modules; swap implementations
 * for real HTTP without changing consumers that use the async API.
 */
import {
  DATA_ASSETS,
  ASSETS_BY_ID,
  getAssetById as dataGetAssetById,
  filterAssetsByQuery,
  getRelatedAssets,
  isSourceDatasetType,
  DATASET_TYPES,
} from '../data/assets';
import { DATA_PRODUCT_FILTER_TYPES } from '../data/sample_data';
import {
  CURATED_LISTS,
  getCuratedListById as dataGetCuratedListById,
  filterCuratedListsByQuery,
} from '../data/curatedLists';
import type { CuratedList } from '../types/catalog';

export type DataAssetRow = (typeof DATA_ASSETS)[number];

const assetsSnapshot = (): DataAssetRow[] => [...DATA_ASSETS];

const listsSnapshot = (): CuratedList[] => [...CURATED_LISTS];

/**
 * Synchronous read API (same thread as React render). Prefer `catalogApi` when
 * introducing loading states and remote sources.
 */
export const catalogData = {
  DATA_ASSETS,
  DATASET_TYPES,
  DATA_PRODUCT_FILTER_TYPES,
  CURATED_LISTS,
  getAssets: () => DATA_ASSETS,
  getAssetsMap: () => ASSETS_BY_ID,
  getAssetById: (id: string | undefined | null) => dataGetAssetById((id ?? '').toLowerCase()),
  getCuratedLists: () => CURATED_LISTS,
  getCuratedListById: (id: string | undefined | null) => dataGetCuratedListById((id ?? '').toLowerCase()),
  filterAssetsByQuery,
  filterCuratedListsByQuery,
  getRelatedAssets,
  isSourceDatasetType,
};

/**
 * Async facade — drop-in for fetch/XHR later.
 */
export const catalogApi = {
  async listAssets(): Promise<DataAssetRow[]> {
    return assetsSnapshot();
  },
  async getAssetById(id: string | undefined | null) {
    return dataGetAssetById(String(id ?? '').toLowerCase());
  },
  async getAssetsMap() {
    return ASSETS_BY_ID;
  },
  async listCuratedLists(): Promise<CuratedList[]> {
    return listsSnapshot();
  },
  async getCuratedListById(id: string | undefined | null): Promise<CuratedList | null> {
    return dataGetCuratedListById(String(id ?? '').toLowerCase());
  },
};

export type { CatalogAssetDetail, CuratedList } from '../types/catalog';
