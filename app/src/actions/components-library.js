export const LIBRARY_EXPANDED_GROUPS =
  'LIBRARY_EXPANDED_GROUPS';
export const LIBRARY_SHOW_ALL_COMPONENTS =
  'LIBRARY_SHOW_ALL_COMPONENTS';
export const LIBRARY_SEARCH =
  'LIBRARY_SEARCH';

/**
 *
 * @param {Immutable.Set<string>} groups
 * @return {Object}
 */
export const setExpandedGroups = groups => ({
  type: LIBRARY_EXPANDED_GROUPS,
  groups,
});

/**
 *
 * @return {Object}
 */
export const showAllComponents = () => ({
  type: LIBRARY_SHOW_ALL_COMPONENTS,
});

/**
 *
 * @param {string} searchString
 * @return {Object}
 */
export const searchComponents = searchString => ({
  type: LIBRARY_SEARCH,
  searchString,
});
