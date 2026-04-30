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

/** @type {typeof DATA_ASSETS} */
const assetsSnapshot = () => [...DATA_ASSETS];

/** @type {typeof CURATED_LISTS} */
const listsSnapshot = () => [...CURATED_LISTS];

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
  getAssetById: (id) => dataGetAssetById((id || '').toLowerCase()),
  getCuratedLists: () => CURATED_LISTS,
  getCuratedListById: (id) => dataGetCuratedListById((id || '').toLowerCase()),
  filterAssetsByQuery,
  filterCuratedListsByQuery,
  getRelatedAssets,
  isSourceDatasetType,
};

/**
 * Async facade — drop-in for fetch/XHR later.
 */
export const catalogApi = {
  async listAssets() {
    return assetsSnapshot();
  },
  async getAssetById(id) {
    return dataGetAssetById(String(id || '').toLowerCase());
  },
  async getAssetsMap() {
    return ASSETS_BY_ID;
  },
  async listCuratedLists() {
    return listsSnapshot();
  },
  async getCuratedListById(id) {
    return dataGetCuratedListById(String(id || '').toLowerCase());
  },
};
