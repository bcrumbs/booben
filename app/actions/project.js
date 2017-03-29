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
export const PROJECT_COMPONENT_UPDATE_PROP_VALUE =
  'PROJECT_COMPONENT_UPDATE_PROP_VALUE';
export const PROJECT_COMPONENT_ADD_PROP_VALUE =
  'PROJECT_COMPONENT_ADD_PROP_VALUE';
export const PROJECT_COMPONENT_DELETE_PROP_VALUE =
  'PROJECT_COMPONENT_DELETE_PROP_VALUE';
export const PROJECT_COMPONENT_RENAME =
  'PROJECT_COMPONENT_RENAME';
export const PROJECT_COMPONENT_TOGGLE_REGION =
  'PROJECT_COMPONENT_TOGGLE_REGION';
export const PROJECT_COMPONENT_DELETE_ACTION =
  'PROJECT_COMPONENT_DELETE_ACTION';
export const PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT =
  'PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT';
export const PROJECT_CONSTRUCT_COMPONENT_FOR_PROP =
  'PROJECT_CONSTRUCT_COMPONENT_FOR_PROP';
export const PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP =
  'PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP';
export const PROJECT_SAVE_COMPONENT_FOR_PROP =
  'PROJECT_SAVE_COMPONENT_FOR_PROP';
export const PROJECT_LINK_PROP =
  'PROJECT_LINK_PROP';
export const PROJECT_LINK_WITH_OWNER_PROP =
  'PROJECT_LINK_WITH_OWNER_PROP';
export const PROJECT_LINK_WITH_DATA =
  'PROJECT_LINK_WITH_DATA';
export const PROJECT_LINK_WITH_FUNCTION =
  'PROJECT_LINK_WITH_FUNCTION';
export const PROJECT_UNLINK_PROP =
  'PROJECT_UNLINK_PROP';
export const PROJECT_LINK_PROP_CANCEL =
  'PROJECT_LINK_PROP_CANCEL';
export const PROJECT_CREATE_FUNCTION =
  'PROJECT_CREATE_FUNCTION';

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

//noinspection JSCheckFunctionSignatures
/**
 *
 * @param {string} projectName
 * @return {Promise<Object[]>}
 */
const loadProjectAndMetadata = projectName =>
  Promise.all([getProject(projectName), getMetadata(projectName)]);

/**
 *
 * @param {string} projectName
 * @return {function(dispatch: function(action: Object))}
 */
export const loadProject = projectName => dispatch => {
  dispatch(requestProject(projectName));

  loadProjectAndMetadata(projectName)
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
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @param {(string|number)[]} path
 * @param {string} newSource
 * @param {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner} newSourceData
 * @param {Object} newQueryArgs
 * @param {boolean} isRootQuery
 * @return {Object}
 */
export const updateComponentPropValue = (
  componentId,
  propName,
  isSystemProp,
  path,
  newSource,
  newSourceData,
  newQueryArgs = {},
  isRootQuery = false,
) => ({
  type: PROJECT_COMPONENT_UPDATE_PROP_VALUE,
  componentId,
  propName,
  isSystemProp,
  path,
  newSource,
  newSourceData,
  newQueryArgs: Object.keys(newQueryArgs).length
    ? newQueryArgs
    : null,
  isRootQuery,
});

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @param {(string|number)[]} path
 * @param {string|number} index
 * @param {string} source
 * @param {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner} sourceData
 * @return {Object}
 */
export const addComponentPropValue = (
  componentId,
  propName,
  isSystemProp,
  path,
  index,
  source,
  sourceData,
) => ({
  type: PROJECT_COMPONENT_ADD_PROP_VALUE,
  componentId,
  propName,
  isSystemProp,
  path,
  index,
  source,
  sourceData,
});

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @param {(string|number)[]} path
 * @param {string|number} index
 * @return {Object}
 */
export const deleteComponentPropValue = (
  componentId,
  propName,
  isSystemProp,
  path,
  index,
) => ({
  type: PROJECT_COMPONENT_DELETE_PROP_VALUE,
  componentId,
  propName,
  isSystemProp,
  path,
  index,
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
 * @typedef {Object} ActionPathStep
 * @property {number} index
 * @property {string} [branch] - 'success' or 'error'
 */

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @param {(string|number)[]} path
 * @param {ActionPathStep[]} actionPath
 * @return {Object}
 */
export const deleteComponentAction = (
  componentId,
  propName,
  isSystemProp,
  path,
  actionPath,
) => ({
  type: PROJECT_COMPONENT_DELETE_ACTION,
  componentId,
  propName,
  isSystemProp,
  path,
  actionPath,
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
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @param {(string|number)[]} path
 * @return {Object}
 */
export const constructComponentForProp = (
  componentId,
  propName,
  isSystemProp,
  path,
) => ({
  type: PROJECT_CONSTRUCT_COMPONENT_FOR_PROP,
  componentId,
  propName,
  isSystemProp,
  path,
});

/**
 *
 * @return {Object}
 */
export const cancelConstructComponentForProp = () => ({
  type: PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP,
});

/**
 *
 * @return {Object}
 */
export const saveComponentForProp = () => ({
  type: PROJECT_SAVE_COMPONENT_FOR_PROP,
});

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @param {(string|number)[]} [path=[]]
 * @return {Object}
 */
export const linkProp = (componentId, propName, isSystemProp, path = []) => ({
  type: PROJECT_LINK_PROP,
  componentId,
  propName,
  isSystemProp,
  path,
});

/**
 *
 * @param {string} ownerPropName
 * @return {Object}
 */
export const linkWithOwnerProp = ownerPropName => ({
  type: PROJECT_LINK_WITH_OWNER_PROP,
  ownerPropName,
});

/**
 *
 * @param {string[]} dataContext
 * @param {string[]} path
 * @param {Immutable.Map<string, Object>} args
 */
export const linkWithData = (dataContext, path, args) => ({
  type: PROJECT_LINK_WITH_DATA,
  dataContext,
  path,
  args,
});

/**
 *
 * @param {string} functionSource
 * @param {string} functionName
 * @param {Immutable.Map<string, Object>} argValues
 * @return {Object}
 */
export const linkWithFunction = (functionSource, functionName, argValues) => ({
  type: PROJECT_LINK_WITH_FUNCTION,
  functionSource,
  functionName,
  argValues,
});

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @param {(string|number)[]} path
 */
export const unlinkProp = (componentId, propName, isSystemProp, path) => ({
  type: PROJECT_UNLINK_PROP,
  componentId,
  propName,
  isSystemProp,
  path,
});

/**
 *
 * @return {Object}
 */
export const linkPropCancel = () => ({
  type: PROJECT_LINK_PROP_CANCEL,
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
