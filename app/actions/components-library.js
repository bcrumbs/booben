/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export const LIBRARY_EXPANDED_GROUPS =
  'LIBRARY_EXPANDED_GROUPS';
export const LIBRARY_SHOW_ALL_COMPONENTS =
  'LIBRARY_SHOW_ALL_COMPONENTS';

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
