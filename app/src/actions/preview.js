/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import triggersProjectSave from './project-save/wrapper';

export const PREVIEW_SELECT_COMPONENT =
  'PREVIEW_SELECT_COMPONENT';
export const PREVIEW_DESELECT_COMPONENT =
  'PREVIEW_DESELECT_COMPONENT';
export const PREVIEW_TOGGLE_COMPONENT_SELECTION =
  'PREVIEW_TOGGLE_COMPONENT_SELECTION';
export const PREVIEW_HIGHLIGHT_COMPONENT =
  'PREVIEW_HIGHLIGHT_COMPONENT';
export const PREVIEW_UNHIGHLIGHT_COMPONENT =
  'PREVIEW_UNHIGHLIGHT_COMPONENT';
export const PREVIEW_START_DRAG_NEW_COMPONENT =
  'PREVIEW_START_DRAG_NEW_COMPONENT';
export const PREVIEW_START_DRAG_EXISTING_COMPONENT =
  'PREVIEW_START_DRAG_EXISTING_COMPONENT';
export const PREVIEW_DRAG_OVER_PLACEHOLDER =
  'PREVIEW_DRAG_OVER_PLACEHOLDER';
export const PREVIEW_DRAG_OVER_NOTHING =
  'PREVIEW_DRAG_OVER_NOTHING';
export const PREVIEW_DROP_COMPONENT =
  'PREVIEW_DROP_COMPONENT';

export const ComponentDropAreas = {
  TREE: 'TREE',
  CANVAS: 'CANVAS',
};

/**
 * @param {Object} componentId
 * @param {boolean} [exclusive=false]
 * @param {boolean} [openConfigurationTool=false]
 * @return {Object}
 */
export const selectPreviewComponent = (
  componentId,
  exclusive = false,
  openConfigurationTool = false,
) => ({
  type: PREVIEW_SELECT_COMPONENT,
  componentId,
  exclusive,
  openConfigurationTool,
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const deselectPreviewComponent = componentId => ({
  type: PREVIEW_DESELECT_COMPONENT,
  componentId,
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const toggleComponentSelection = componentId => ({
  type: PREVIEW_TOGGLE_COMPONENT_SELECTION,
  componentId,
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const highlightPreviewComponent = componentId => ({
  type: PREVIEW_HIGHLIGHT_COMPONENT,
  componentId,
});

/**
 * @param  {Object} componentId
 * @return {Object}
 */
export const unhighlightPreviewComponent = componentId => ({
  type: PREVIEW_UNHIGHLIGHT_COMPONENT,
  componentId,
});

/**
 *
 * @param {Immutable.Map} components
 * @return {Object}
 */
export const startDragNewComponent = components => ({
  type: PREVIEW_START_DRAG_NEW_COMPONENT,
  components,
});

/**
 *
 * @param {number} componentId
 * @return {Object}
 */
export const startDragExistingComponent = componentId => ({
  type: PREVIEW_START_DRAG_EXISTING_COMPONENT,
  componentId,
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
  afterIdx,
});

export const dragOverNothing = () => ({
  type: PREVIEW_DRAG_OVER_NOTHING,
});

/**
 *
 * @return {Object}
 */
export const dropComponent = triggersProjectSave(dropArea => ({
  type: PREVIEW_DROP_COMPONENT,
  dropArea,
}));
