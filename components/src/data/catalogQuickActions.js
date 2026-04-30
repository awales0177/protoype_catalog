import {
  SearchIcon,
  FileIcon,
  DataProductIcon,
  DeliveryVanIcon,
} from '../icons';

/** Shared placeholder body copy (matches reference Actions panel). */
export const CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION =
  'Description text that explains what they can expect this function to do.';

/**
 * Header Actions dropdown entries — `CatalogHeroActionsMenu`.
 * `iconKind: 'flow'` uses the flow-modeler artwork; otherwise `Icon` is required.
 */
export const CATALOG_QUICK_ACTION_SPECS = [
  {
    id: 'find-data',
    label: 'Find Data',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    Icon: SearchIcon,
  },
  {
    id: 'register-dataset-or-product',
    label: 'Register a Dataset or Data Product',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    Icon: FileIcon,
  },
  {
    id: 'register-data-model',
    label: 'Register a Data Model',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    Icon: DataProductIcon,
  },
  {
    id: 'register-data-tool',
    label: 'Register a Data Tool',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    Icon: DeliveryVanIcon,
  },
  {
    id: 'create-product-agreement',
    label: 'Create a Product Agreement',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    iconKind: 'flow',
  },
  {
    id: 'create-curated-list',
    label: 'Create Curated List',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    iconKind: 'flow',
  },
  {
    id: 'transfer-transport-data',
    label: 'Transfer or Transport Data',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    iconKind: 'flow',
  },
  {
    id: 'request-data-conditioning',
    label: 'Request Data Conditioning',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    iconKind: 'flow',
  },
  {
    id: 'request-enhanced-discovery',
    label: 'Request Enhanced Discovery',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    iconKind: 'flow',
  },
  {
    id: 'request-data-profiling',
    label: 'Request Data Profiling',
    description: CATALOG_QUICK_ACTIONS_PLACEHOLDER_DESCRIPTION,
    iconKind: 'flow',
  },
];
