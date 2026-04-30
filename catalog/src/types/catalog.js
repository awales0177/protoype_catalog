/**
 * @typedef {Object} Asset
 * @property {string} id
 * @property {string} name
 * @property {string} type
 * @property {string} [desc]
 * @property {string} [parentId]
 * @property {boolean} [stale]
 * @property {boolean} [feed]
 * @property {boolean} [noDataAccess]
 */

/**
 * @typedef {Object} CuratedList
 * @property {string} id
 * @property {string} title
 * @property {string} [description]
 * @property {string[]} assetIds
 * @property {string} [owner]
 * @property {string} [updated]
 * @property {'public'|'private'} [visibility]
 * @property {string[]} [curators]
 */

export {};
