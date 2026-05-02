import { useState, useEffect, type FormEvent, type MouseEvent } from 'react';
import type { NavigateFunction } from 'react-router-dom';
import { search } from '../routes';
import {
  BRONZE_PARENT_DATASET_IDS,
  DATASET_FILTER_OPTIONS,
  DATA_PRODUCT_FILTER_OPTIONS,
} from '../data/sample_data';
import { catalogData, type DataAssetRow } from '../services/catalogApi';

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

type SearchFacetTab = 'all' | 'datasets' | 'data-products' | 'curated-lists';

type FilterPanelKey = 'tag' | 'status' | 'dataset' | 'dataProduct';

/** Derive search facet tab from URL so state stays in sync when params are added or removed. */
function activeTabFromSearchParams(searchParams: URLSearchParams): SearchFacetTab {
  const typeParam = searchParams.get('type');
  if (typeParam === 'datasets') return 'datasets';
  if (typeParam === 'data-products' || searchParams.get('layer') === 'bronze') return 'data-products';
  if (typeParam === 'curated-lists') return 'curated-lists';
  return 'all';
}

export function useSearchResults(searchParams: URLSearchParams, navigate: NavigateFunction) {
  const q = searchParams.get('q') || '';
  const layerParam = searchParams.get('layer');
  const [inputValue, setInputValue] = useState(q);
  const [activeTab, setActiveTab] = useState<SearchFacetTab>(() => activeTabFromSearchParams(searchParams));
  const [expandedDatasetId, setExpandedDatasetId] = useState<string | null>(null);
  const [expandedListId, setExpandedListId] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState<Record<FilterPanelKey, boolean>>({
    tag: true,
    status: true,
    dataset: true,
    dataProduct: true,
  });
  const [selectedDatasetTypes, setSelectedDatasetTypes] = useState<string[]>(['Parent dataset', 'Adoption record']);
  const [selectedDataProductTypes, setSelectedDataProductTypes] = useState<string[]>([
    'Aggregated data product',
    'Transfer record',
  ]);
  const [showInProgressOnly, setShowInProgressOnly] = useState(false);

  useEffect(() => {
    setInputValue(q);
  }, [q]);

  useEffect(() => {
    setActiveTab(activeTabFromSearchParams(searchParams));
  }, [searchParams]);

  let results: DataAssetRow[] = filterAssetsByQuery(DATA_ASSETS, q);
  if (activeTab === 'datasets') results = results.filter((a) => DATASET_TYPES.includes(a.type));
  if (activeTab === 'data-products') results = results.filter((a) => DATA_PRODUCT_FILTER_TYPES.includes(a.type));
  if (activeTab === 'curated-lists') results = [];
  if (selectedDatasetTypes.length > 0) {
    results = results.filter((a) => (DATASET_TYPES.includes(a.type) ? selectedDatasetTypes.includes(a.type) : true));
  }
  if (selectedDataProductTypes.length > 0) {
    results = results.filter((a) =>
      DATA_PRODUCT_FILTER_TYPES.includes(a.type) ? selectedDataProductTypes.includes(a.type) : true
    );
  }
  if (layerParam === 'bronze')
    results = results.filter(
      (a) =>
        a.type === 'Derived data product' &&
        a.sourceDatasetIds?.some((sid) => BRONZE_PARENT_DATASET_IDS.includes(sid))
    );
  if (showInProgressOnly) results = results.filter((a) => a.transferProgress);

  const curatedResults = filterCuratedListsByQuery(CURATED_LISTS, q);
  const displayCount = activeTab === 'curated-lists' ? curatedResults.length : results.length;
  const showCuratedContent = activeTab === 'curated-lists';

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = inputValue.trim();
    navigate(trimmed ? search({ q: trimmed }) : search());
  };

  const toggleFilter = (key: FilterPanelKey) => {
    setFilterOpen((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleDatasetExpand = (e: MouseEvent, assetId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDatasetId((prev) => (prev === assetId ? null : assetId));
  };

  const toggleCuratedListExpand = (e: MouseEvent, listId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedListId((prev) => (prev === listId ? null : listId));
  };

  const getDatasetFilter = (typeValue: string) => {
    const isActive = selectedDatasetTypes.includes(typeValue);
    const onClick = () => {
      setSelectedDatasetTypes((prev) =>
        prev.includes(typeValue) ? prev.filter((t) => t !== typeValue) : [...prev, typeValue]
      );
    };
    return { isActive, onClick };
  };
  const getDataProductFilter = (typeValue: string) => {
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
