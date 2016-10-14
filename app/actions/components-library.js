/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {string}
 */
export const LIBRARY_EXPANDED_GROUPS = 'LIBRARY_EXPANDED_GROUPS';

/**
 *
 * @param {Immutable.Set} groups
 * @return {Object}
 */
export const setExpandedGroups = groups => ({
    type: LIBRARY_EXPANDED_GROUPS,
    groups
});

/**
 *
 * @type {string}
 */
export const LIBRARY_FOCUS_COMPONENT = 'LIBRARY_FOCUS_COMPONENT';

/**
 *
 * @param {string} componentName
 * @return {Object}
 */
export const focusComponent = componentName => ({
    type: LIBRARY_FOCUS_COMPONENT,
    componentName
});
