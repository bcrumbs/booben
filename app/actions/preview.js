'use strict';

/**
 *
 * @type {string}
 */
export const DESELECT_PREVIEW_COMPONENT = 'DESELECT_PREVIEW_COMPONENT';
export const SELECT_PREVIEW_COMPONENT = 'SELECT_PREVIEW_COMPONENT';
export const UNHIGHLIGHT_PREVIEW_COMPONENT = 'UNHIGHLIGHT_PREVIEW_COMPONENT';
export const HIGHLIGHT_PREVIEW_COMPONENT = 'HIGHLIGHT_PREVIEW_COMPONENT';
export const SET_ROOT_COMPONENT = 'SET_ROOT_COMPONENT';
export const UNSET_ROOT_COMPONENT = 'UNSET_ROOT_COMPONENT';
export const SHOW_ROOT_COMPONENT = 'SHOW_ROOT_COMPONENT';
export const HIDE_ROOT_COMPONENT = 'HIDE_ROOT_COMPONENT';
export const SET_IS_INDEX_ROUTE = 'SET_IS_INDEX_ROUTE';

/**
 * @param {Object} component
 * @param {boolean} [exclusive=false]
 * @return {Object}
 */
export const selectPreviewComponent = (component, exclusive = false) => ({
    type: SELECT_PREVIEW_COMPONENT,
    component,
    exclusive
});

/**
 * @param  {Object} component
 * @return {Object}
 */
export const deselectPreviewComponent = component => ({
    type: DESELECT_PREVIEW_COMPONENT,
    component
});

/**
 * @param  {Object} component
 * @return {Object}
 */
export const highlightPreviewComponent = component => ({
    type: HIGHLIGHT_PREVIEW_COMPONENT,
    component
});

/**
 * @param  {Object} component
 * @return {Object}
 */
export const unhighlightPreviewComponent = component => ({
    type: UNHIGHLIGHT_PREVIEW_COMPONENT,
    component
});

/**
 * @param  {string} component
 * @return {Object}
 */
export const setRootComponent = component => ({
    type: SET_ROOT_COMPONENT,
    component
});

/**
 * @param  {string} component
 * @return {Object}
 */
export const unsetRootComponent = component => ({
    type: UNSET_ROOT_COMPONENT,
    component
});

/**
 * @return {Object}
 */
export const showPreviewRootComponent = () => ({
    type: SHOW_ROOT_COMPONENT
});

/**
 * @return {Object}
 */
export const hidePreviewRootComponent = () => ({
    type: HIDE_ROOT_COMPONENT
});

/**
 * @param  {boolean} value
 * @return {Object}
 */
export const setIsIndexRoute = value => ({
    type: SET_IS_INDEX_ROUTE,
    value
});
