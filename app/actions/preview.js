'use strict';

/**
 *
 * @type {string}
 */
export const UPDATE_PREVIEW_SELECTED = 'UPDATE_PREVIEW_SELECTED';
export const UPDATE_PREVIEW_HIGHLIGHTED = 'UPDATE_PREVIEW_HIGLIGHTED';

/**
 * @param  {Array} selectedItems
 * @return {Object}
 */
export const updatePreviewSelected = (selectedItems) => ({
    type: UPDATE_PREVIEW_SELECTED,
    selectedItems
});

/**
 * @param  {Array} highlightedItems
 * @return {Object}
 */
export const updatePreviewHighlighted = (highlightedItems) => ({
    type: UPDATE_PREVIEW_HIGHLIGHTED,
    highlightedItems
});