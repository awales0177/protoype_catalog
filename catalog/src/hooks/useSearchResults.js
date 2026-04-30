import { useState, useEffect } from 'react';
import { search } from '../routes';
import {
  BRONZE_PARENT_DATASET_IDS,
  DATASET_FILTER_OPTIONS,
  DATA_PRODUCT_FILTER_OPTIONS,
} from '../data/sample_data';
import { catalogData } from '../services/catalogApi';

const {
  DATA_ASSETS,
  DATASET_TYPES,
  DATA_PRODUCT_FILTER_TYPES,
  CURATED_LISTS,
  filterAssetsByQuery,
  filterCuratedListsByQuery,
  getRelatedAssets,
  isSourceDatasetType,
} = catalogData;

/** Derive search facet tab from URL so state stays in sync when params are added or removed. */
function activeTabFromSearchParams(searchParams) {
  const typeParam = searchParams.get('type');
  if (typeParam === 'datasets') return 'datasets';
  if (typeParam === 'data-products' || searchParams.get('layer') === 'bronze') return 'data-products';
  if (typeParam === 'curated-lists') return 'curated-lists';
  return 'all';
}

export function useSearchResults(searchParams, navigate) {
  const q = searchParams.get('q') || '';
  const layerParam = searchParams.get('layer');
  const [inputValue, setInputValue] = useState(q);
  const [activeTab, setActiveTab] = useState(() => activeTabFromSearchParams(searchParams));
  const [expandedDatasetId, setExpandedDatasetId] = useState(null);
  const [expandedListId, setExpandedListId] = useState(null);
  const [filterOpen, setFilterOpen] = useState({ tag: true, status: true, dataset: true, dataProduct: true });
  const [selectedDatasetTypes, setSelectedDatasetTypes] = useState(['Parent dataset', 'Adoption record']);
  const [selectedDataProductTypes, setSelectedDataProductTypes] = useState(['Aggregated data product', 'Transfer record']);
  const [showInProgressOnly, setShowInProgressOnly] = useState(false);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  useEffect(() => {
    setActiveTab(activeTabFromSearchParams(searchParams));
  }, [searchParams]);

  let results = filterAssetsByQuery(DATA_ASSETS, q);
  if (activeTab === 'datasets') results = results.filter((a) => DATASET_TYPES.includes(a.type));
  if (activeTab === 'data-products') results = results.filter((a) => DATA_PRODUCT_FILTER_TYPES.includes(a.type));
  if (activeTab === 'curated-lists') results = [];
  if (selectedDatasetTypes.length > 0) {
    results = results.filter((a) => (DATASET_TYPES.includes(a.type) ? selectedDatasetTypes.includes(a.type) : true));
  }
  if (selectedDataProductTypes.length > 0) {
    results = results.filter((a) => (DATA_PRODUCT_FILTER_TYPES.includes(a.type) ? selectedDataProductTypes.includes(a.type) : true));
  }
  if (layerParam === 'bronze') results = results.filter((a) => a.type === 'Derived data product' && a.sourceDatasetIds?.some((sid) => BRONZE_PARENT_DATASET_IDS.includes(sid)));
  if (showInProgressOnly) results = results.filter((a) => a.transferProgress);

  const curatedResults = filterCuratedListsByQuery(CURATED_LISTS, q);
  const displayCount = activeTab === 'curated-lists' ? curatedResults.length : results.length;
  const showCuratedContent = activeTab === 'curated-lists';

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    navigate(trimmed ? search({ q: trimmed }) : search());
  };

  const toggleFilter = (key) => {
    setFilterOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDatasetExpand = (e, assetId) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDatasetId((prev) => (prev === assetId ? null : assetId));
  };

  const toggleCuratedListExpand = (e, listId) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedListId((prev) => (prev === listId ? null : listId));
  };

  const getDatasetFilter = (typeValue) => {
    const isActive = selectedDatasetTypes.includes(typeValue);
    const onClick = () => {
      setSelectedDatasetTypes((prev) =>
        prev.includes(typeValue) ? prev.filter((t) => t !== typeValue) : [...prev, typeValue]
      );
    };
    return { isActive, onClick };
  };
  const getDataProductFilter = (typeValue) => {
    const isActive = selectedDataProductTypes.includes(typeValue);
    const onClick = () => {
      setSelectedDataProductTypes((prev) =>
        prev.includes(typeValue) ? prev.filter((t) => t !== typeValue) : [...prev, typeValue]
      );
    };
    return { isActive, onClick };
  };

  return {
    BRONZE_PARENT_DATASET_IDS,
    DATA_PRODUCT_FILTER_TYPES,
    q,
    inputValue,
    setInputValue,
    activeTab,
    setActiveTab,
    expandedDatasetId,
    expandedListId,
    filterOpen,
    results,
    curatedResults,
    displayCount,
    showCuratedContent,
    handleSubmit,
    toggleFilter,
    toggleDatasetExpand,
    setExpandedDatasetId,
    toggleCuratedListExpand,
    getDatasetFilter,
    getDataProductFilter,
    getRelatedAssets,
    isSourceDatasetType,
    DATASET_FILTER_OPTIONS,
    DATA_PRODUCT_FILTER_OPTIONS,
    showInProgressOnly,
    setShowInProgressOnly,
  };
}
