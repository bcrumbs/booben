/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { getProject, getMetadata, getFullGraphQLSchema } from '../api';

export const PROJECT_REQUEST =
  'PROJECT_REQUEST';
export const PROJECT_LOADED =
  'PROJECT_LOADED';
export const PROJECT_LOAD_FAILED =
  'PROJECT_LOAD_FAILED';

export const PROJECT_ROUTE_CREATE =
  'PROJECT_ROUTE_CREATE';
export const PROJECT_ROUTE_DELETE =
  'PROJECT_ROUTE_DELETE';
export const PROJECT_ROUTE_UPDATE_FIELD =
  'PROJECT_ROUTE_UPDATE_FIELD';

export const PROJECT_COMPONENT_DELETE =
  'PROJECT_COMPONENT_DELETE';
export const PROJECT_COMPONENT_RENAME =
  'PROJECT_COMPONENT_RENAME';
export const PROJECT_COMPONENT_TOGGLE_REGION =
  'PROJECT_COMPONENT_TOGGLE_REGION';
export const PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT =
  'PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT';

export const PROJECT_CREATE_FUNCTION =
  'PROJECT_CREATE_FUNCTION';

export const PROJECT_JSSY_VALUE_REPLACE =
  'PROJECT_JSSY_VALUE_REPLACE';
export const PROJECT_JSSY_VALUE_ADD_ACTION =
  'PROJECT_JSSY_VALUE_ADD_ACTION';
export const PROJECT_JSSY_VALUE_REPLACE_ACTION =
  'PROJECT_JSSY_VALUE_REPLACE_ACTION';
export const PROJECT_JSSY_VALUE_DELETE_ACTION =
  'PROJECT_JSSY_VALUE_DELETE_ACTION';
export const PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT =
  'PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT';
export const PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_SAVE =
  'PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_SAVE';
export const PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_CANCEL =
  'PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_CANCEL';

export const PROJECT_LINK_DIALOG_OPEN =
  'PROJECT_LINK_DIALOG_OPEN';
export const PROJECT_LINK_DIALOG_CLOSE =
  'PROJECT_JSSY_VALUE_LINK_CANCEL';

export const PROJECT_PICK_COMPONENT =
  'PROJECT_PICK_COMPONENT';
export const PROJECT_PICK_COMPONENT_DONE =
  'PROJECT_PICK_COMPONENT_DONE';
export const PROJECT_PICK_COMPONENT_CANCEL =
  'PROJECT_PICK_COMPONENT_CANCEL';
export const PROJECT_PICK_COMPONENT_STATE_SLOT =
  'PROJECT_PICK_COMPONENT_STATE_SLOT';

/**
 *
 * @param {string} projectName
 * @return {Object}
 */
const requestProject = projectName => ({
  type: PROJECT_REQUEST,
  projectName,
});

/**
 *
 * @param {Object} project
 * @param {Object} metadata
 * @param {Object} [schema=null]
 * @return {Object}
 */
const projectLoaded = (project, metadata, schema = null) => ({
  type: PROJECT_LOADED,
  project,
  metadata,
  schema,
});

/**
 *
 * @param {Object} error
 * @return {Object}
 */
const projectLoadFailed = error => ({
  type: PROJECT_LOAD_FAILED,
  error,
});

/**
 *
 * @param {string} projectName
 * @return {function(dispatch: function(action: Object))}
 */
export const loadProject = projectName => dispatch => {
  dispatch(requestProject(projectName));
  
  //noinspection JSCheckFunctionSignatures
  Promise.all([getProject(projectName), getMetadata(projectName)])
    .then(([project, metadata]) => {
      if (project.graphQLEndpointURL) {
        getFullGraphQLSchema(project.graphQLEndpointURL)
          .then(schema =>
            void dispatch(projectLoaded(project, metadata, schema)),
          )
          .catch(error => void dispatch(projectLoadFailed(error)));
      } else {
        dispatch(projectLoaded(project, metadata));
      }
    })
    .catch(err => void dispatch(projectLoadFailed(err)));
};

/**
 *
 * @param {number} parentRouteId - id of parent route (or -1 for root route)
 * @param {string} path
 * @param {string} title
 * @return {Object}
 */
export const createRoute = (parentRouteId, path, title) => ({
  type: PROJECT_ROUTE_CREATE,
  parentRouteId,
  path,
  title,
});

/**
 *
 * @param {number} routeId
 * @return {Object}
 */
export const deleteRoute = routeId => ({
  type: PROJECT_ROUTE_DELETE,
  routeId,
});

/**
 *
 * @param {number} routeId
 * @param {string} field
 * @param {*} newValue
 * @return {Object}
 */
export const updateRouteField = (routeId, field, newValue) => ({
  type: PROJECT_ROUTE_UPDATE_FIELD,
  routeId,
  field,
  newValue,
});

/**
 *
 * @param {string} componentId - Component ID
 * @return {Object}
 */
export const deleteComponent = componentId => ({
  type: PROJECT_COMPONENT_DELETE,
  componentId,
});

/**
 *
 * @param {Path} path
 * @param {JssyValue} newValue
 * @return {Object}
 */
export const replaceJssyValue = (path, newValue) => ({
  type: PROJECT_JSSY_VALUE_REPLACE,
  path,
  newValue,
});

/**
 *
 * @param {Path} path - Path to actions list
 * @param {Object} action
 * @return {Object}
 */
export const addAction = (path, action) => ({
  type: PROJECT_JSSY_VALUE_ADD_ACTION,
  path,
  action,
});

/**
 *
 * @param {Path} path - Path to actions list
 * @param {number} index - Index in actions list
 * @param {Object} newAction
 * @return {Object}
 */
export const replaceAction = (path, index, newAction) => ({
  type: PROJECT_JSSY_VALUE_REPLACE_ACTION,
  path,
  index,
  newAction,
});

/**
 *
 * @param {Path} path - Path to actions list
 * @param {number} index
 * @return {Object}
 */
export const deleteAction = (path, index) => ({
  type: PROJECT_JSSY_VALUE_DELETE_ACTION,
  path,
  index,
});

/**
 *
 * @param {Path} path
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootId
 * @return {Object}
 */
export const constructComponentForProp = (path, components, rootId) => ({
  type: PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT,
  path,
  components,
  rootId,
});

/**
 *
 * @return {Object}
 */
export const cancelConstructComponentForProp = () => ({
  type: PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_CANCEL,
});

/**
 *
 * @return {Object}
 */
export const saveComponentForProp = () => ({
  type: PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_SAVE,
});

/**
 *
 * @param {Path} path
 * @return {Object}
 */
export const linkDialogOpen = path => ({
  type: PROJECT_LINK_DIALOG_OPEN,
  path,
});

/**
 *
 * @return {Object}
 */
export const linkDialogClose = () => ({
  type: PROJECT_LINK_DIALOG_CLOSE,
});

/**
 *
 * @param {number} componentId
 * @param {string} newTitle
 * @return {Object}
 */
export const renameComponent = (componentId, newTitle) => ({
  type: PROJECT_COMPONENT_RENAME,
  componentId,
  newTitle,
});

/**
 *
 * @param {number} componentId
 * @param {number} regionIdx
 * @param {boolean} enable
 * @return {Object}
 */
export const toggleComponentRegion = (componentId, regionIdx, enable) => ({
  type: PROJECT_COMPONENT_TOGGLE_REGION,
  componentId,
  regionIdx,
  enable,
});

/**
 *
 * @param {number} layoutIdx
 * @return {Object}
 */
export const selectLayoutForNewComponent = layoutIdx => ({
  type: PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT,
  layoutIdx,
});

/**
 *
 * @param {string} name
 * @param {string} title
 * @param {string} description
 * @param {{ name: string, type: string }[]} args
 * @param {string} returnType
 * @param {string} code
 * @return {Object}
 */
export const createFunction = (
  name,
  title,
  description,
  args,
  returnType,
  code,
) => ({
  type: PROJECT_CREATE_FUNCTION,
  name,
  title,
  description,
  args,
  returnType,
  code,
});

/**
 *
 * @param {?Function} [filter=null]
 * @return {Object}
 */
export const pickComponent = (filter = null) => ({
  type: PROJECT_PICK_COMPONENT,
  stateSlot: false,
  filter,
  stateSlotsFilter: null,
});

/**
 *
 * @param {?Function} [filter=null]
 * @param {?Function} [stateSlotsFilter=null]
 * @return {Object}
 */
export const pickComponentStateSlot = (
  filter = null,
  stateSlotsFilter = null,
) => ({
  type: PROJECT_PICK_COMPONENT,
  stateSlot: true,
  filter,
  stateSlotsFilter,
});

/**
 *
 * @param {number} componentId
 * @return {Object}
 */
export const pickComponentDone = componentId => ({
  type: PROJECT_PICK_COMPONENT_DONE,
  componentId,
});

/**
 *
 * @return {Object}
 */
export const pickComponentCancel = () => ({
  type: PROJECT_PICK_COMPONENT_CANCEL,
});

/**
 *
 * @param {string} slotName
 * @return {Object}
 */
export const pickComponentStateSlotDone = slotName => ({
  type: PROJECT_PICK_COMPONENT_STATE_SLOT,
  slotName,
});
