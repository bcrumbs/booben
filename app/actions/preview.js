'use strict';

/**
 *
 * @type {string}
 */
export const DESELECT_PREVIEW_COMPONENT = 'DESELECT_PREVIEW_COMPONENT';
export const SELECT_PREVIEW_COMPONENT = 'SELECT_PREVIEW_COMPONENT';
export const UNHIGHLIGHT_PREVIEW_COMPONENT = 'UNHIGHLIGHT_PREVIEW_COMPONENT';
export const HIGHLIGHT_PREVIEW_COMPONENT = 'HIGHLIGHT_PREVIEW_COMPONENT';

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