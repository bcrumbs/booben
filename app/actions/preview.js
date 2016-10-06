'use strict';

/**
 *
 * @type {string}
 */
export const DESELECT_PREVIEW_COMPONENT = 'DESELECT_PREVIEW_COMPONENT';
export const SELECT_PREVIEW_COMPONENT = 'SELECT_PREVIEW_COMPONENT';
export const UNHIGHLIGHT_PREVIEW_COMPONENT = 'UNHIGHLIGHT_PREVIEW_COMPONENT';
export const HIGHLIGHT_PREVIEW_COMPONENT = 'HIGHLIGHT_PREVIEW_COMPONENT';
export const SET_PREVIEW_WORKSPACE = 'SET_PREVIEW_WORKSPACE';
export const UNSET_PREVIEW_WORKSPACE = 'UNSET_PREVIEW_WORKSPACE';
export const SHOW_PREVIEW_WORKSPACE = 'SHOW_PREVIEW_WORKSPACE';
export const HIDE_PREVIEW_WORKSPACE = 'HIDE_PREVIEW_WORKSPACE';
export const SET_DOM_ELEMENT_TO_MAP = 'SET_DOM_ELEMENT_TO_MAP';
export const SET_IS_INDEX_ROUTE = 'SET_IS_INDEX_ROUTE';

/**
 * @param  {Object} component
 * @return {Object}
 */
export const selectPreviewComponent = component => ({
    type: SELECT_PREVIEW_COMPONENT,
    component
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
export const setPreviewWorkspace = component => ({
    type: SET_PREVIEW_WORKSPACE,
    component
});

/**
 * @param  {string} component
 * @return {Object}
 */
export const unsetPreviewWorkspace = component => ({
    type: UNSET_PREVIEW_WORKSPACE,
    component
});

/**
 * @return {Object}
 */
export const showPreviewWorkspace = () => ({
    type: SHOW_PREVIEW_WORKSPACE
});

/**
 * @return {Object}
 */
export const hidePreviewWorkspace = () => ({
    type: HIDE_PREVIEW_WORKSPACE
});

/**
 * @param  {string} uid
 * @param  {Object} component
 * @return {Object}
 */
export const setDomElementToMap = (uid, component) => ({
    type: SET_DOM_ELEMENT_TO_MAP,
    uid,
    component
});

/**
 * @param  {boolean} value
 * @return {Object}
 */
export const setIsIndexRoute = value => ({
    type: SET_IS_INDEX_ROUTE,
    value
});
