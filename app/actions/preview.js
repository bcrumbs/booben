'use strict';

export const PREVIEW_SELECT_COMPONENT = 'PREVIEW_SELECT_COMPONENT';
export const PREVIEW_DESELECT_COMPONENT = 'PREVIEW_DESELECT_COMPONENT';
export const PREVIEW_TOGGLE_COMPONENT_SELECTION = 'PREVIEW_TOGGLE_COMPONENT_SELECTION';
export const PREVIEW_HIGHLIGHT_COMPONENT = 'PREVIEW_HIGHLIGHT_COMPONENT';
export const PREVIEW_UNHIGHLIGHT_COMPONENT = 'PREVIEW_UNHIGHLIGHT_COMPONENT';
export const PREVIEW_TOGGLE_HIGHLIGHTING = 'PREVIEW_TOGGLE_HIGHLIGHTING';
export const PREVIEW_SET_BOUNDARY_COMPONENT = 'PREVIEW_SET_BOUNDARY_COMPONENT';
export const PREVIEW_SET_IS_INDEX_ROUTE = 'PREVIEW_SET_IS_INDEX_ROUTE';
export const PREVIEW_START_DRAG_COMPONENT = 'PREVIEW_START_DRAG_COMPONENT';
export const PREVIEW_STOP_DRAG_COMPONENT = 'PREVIEW_STOP_DRAG_COMPONENT';
export const PREVIEW_DRAG_OVER_COMPONENT = 'PREVIEW_DRAG_OVER_COMPONENT';
export const PREVIEW_DRAG_OVER_PLACEHOLDER = 'PREVIEW_DRAG_OVER_PLACEHOLDER';

/**
 * @param {Object} componentId
 * @param {boolean} [exclusive=false]
 * @return {Object}
 */
export const selectPreviewComponent = (componentId, exclusive = false) => ({
    type: PREVIEW_SELECT_COMPONENT,
    componentId,
    exclusive
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const deselectPreviewComponent = componentId => ({
    type: PREVIEW_DESELECT_COMPONENT,
    componentId
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const toggleComponentSelection = componentId => ({
    type: PREVIEW_TOGGLE_COMPONENT_SELECTION,
    componentId
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const highlightPreviewComponent = componentId => ({
    type: PREVIEW_HIGHLIGHT_COMPONENT,
    componentId
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const unhighlightPreviewComponent = componentId => ({
    type: PREVIEW_UNHIGHLIGHT_COMPONENT,
    componentId
});

/**
 * @return {Object}
 */
export const toggleHighlighting = enable => ({
    type: PREVIEW_TOGGLE_HIGHLIGHTING,
    enable
});

/**
 *
 * @param {?number} componentId
 * @return {Object}
 */
export const setBoundaryComponent = componentId => ({
    type: PREVIEW_SET_BOUNDARY_COMPONENT,
    componentId
});

/**
 * @param  {boolean} value
 * @return {Object}
 */
export const setIsIndexRoute = value => ({
    type: PREVIEW_SET_IS_INDEX_ROUTE,
    value
});

/**
 *
 * @param {string} componentName
 * @param {?Immutable.Record} component
 * @return {Object}
 */
export const startDragComponent = (componentName, component = null) => ({
    type: PREVIEW_START_DRAG_COMPONENT,
    componentName,
    component
});

/**
 *
 * @return {Object}
 */
export const stopDragComponent = () => ({
    type: PREVIEW_STOP_DRAG_COMPONENT
});

/**
 *
 * @param {number} componentId
 * @return {Object}
 */
export const dragOverComponent = componentId => ({
    type: PREVIEW_DRAG_OVER_COMPONENT,
    componentId
});

/**
 *
 * @param {number} containerId
 * @param {number} afterIdx
 * @return {Object}
 */
export const dragOverPlaceholder = (containerId, afterIdx) => ({
    type: PREVIEW_DRAG_OVER_PLACEHOLDER,
    containerId,
    afterIdx
});
