'use strict';

/**
 *
 * @type {string}
 */
export const UPDATE_PREVIEW_SELECTED = 'UPDATE_PREVIEW_SELECTED';

/**
 * @param  {Array} selectedItems
 * @return {Object}
 */
export const updatePreviewSelected = (selectedItems) => ({
    type: UPDATE_PREVIEW_SELECTED,
    selectedItems
});