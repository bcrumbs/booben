/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { getProject, getMetadata, getFullGraphQLSchema } from '../api';
import { Record, Map } from 'immutable';

/**
 *
 * @type {string}
 */
export const PROJECT_REQUEST = 'PROJECT_REQUEST';

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
 * @type {string}
 */
export const PROJECT_LOADED = 'PROJECT_LOADED';

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
 * @type {string}
 */
export const PROJECT_LOAD_FAILED = 'PROJECT_LOAD_FAILED';

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

  Promise.all([getProject(projectName), getMetadata(projectName)])
        .then(([project, metadata]) => {
          if (project.graphQLEndpointURL) {
            getFullGraphQLSchema(project.graphQLEndpointURL)
                    .then(schema =>
                        void dispatch(projectLoaded(project, metadata, schema)),
                    )
                    .catch(error => void dispatch(projectLoadFailed(error)));
          } else dispatch(projectLoaded(project, metadata));
        })
        .catch(err => void dispatch(projectLoadFailed(err)));
};


/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_CREATE = 'PROJECT_ROUTE_CREATE';

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
 * @type {string}
 */
export const PROJECT_ROUTE_DELETE = 'PROJECT_ROUTE_DELETE';

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
 * @type {string}
 */
export const PROJECT_ROUTE_UPDATE_FIELD = 'PROJECT_ROUTE_UPDATE_FIELD';

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
 * @type {string}
 */
export const PROJECT_COMPONENT_DELETE = 'PROJECT_COMPONENT_DELETE';

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
 * @type {string}
 * @const
 */
export const PROJECT_COMPONENT_UPDATE_PROP_VALUE = 'PROJECT_COMPONENT_UPDATE_PROP_VALUE';

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {(string|number)[]} path
 * @param {string} newSource
 * @param {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner} newSourceData
 * @return {Object}
 */
export const updateComponentPropValue = (
    componentId,
    propName,
    path,
    newSource,
    newSourceData,
    newQueryArgs = {},
    isRootQuery = false,
) => ({
  type: PROJECT_COMPONENT_UPDATE_PROP_VALUE,
  componentId,
  propName,
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
 * @type {string}
 * @const
 */
export const PROJECT_COMPONENT_ADD_PROP_VALUE = 'PROJECT_COMPONENT_ADD_PROP_VALUE';

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {(string|number)[]} path
 * @param {string|number} index
 * @param {string} source
 * @param {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataActions|SourceDataDesigner} sourceData
 * @return {Object}
 */
export const addComponentPropValue = (
    componentId,
    propName,
    path,
    index,
    source,
    sourceData,
) => ({
  type: PROJECT_COMPONENT_ADD_PROP_VALUE,
  componentId,
  propName,
  path,
  index,
  source,
  sourceData,
});

/**
 *
 * @type {string}
 * @const
 */
export const PROJECT_COMPONENT_DELETE_PROP_VALUE = 'PROJECT_COMPONENT_DELETE_PROP_VALUE';

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {(string|number)[]} path
 * @param {string|number} index
 * @return {Object}
 */
export const deleteComponentPropValue = (componentId, propName, path, index) => ({
  type: PROJECT_COMPONENT_DELETE_PROP_VALUE,
  componentId,
  propName,
  path,
  index,
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_RENAME = 'PROJECT_COMPONENT_RENAME';

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
 * @type {string}
 */
export const PROJECT_COMPONENT_TOGGLE_REGION = 'PROJECT_COMPONENT_TOGGLE_REGION';

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
 * @type {string}
 * @const
 */
export const PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT = 'PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT';

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
 * @type {string}
 * @const
 */
export const PROJECT_CONSTRUCT_COMPONENT_FOR_PROP = 'PROJECT_CONSTRUCT_COMPONENT_FOR_PROP';

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {(string|number)[]} path
 * @return {Object}
 */
export const constructComponentForProp = (componentId, propName, path) => ({
  type: PROJECT_CONSTRUCT_COMPONENT_FOR_PROP,
  componentId,
  propName,
  path,
});

/**
 *
 * @type {string}
 * @const
 */
export const PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP = 'PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP';

/**
 *
 * @return {Object}
 */
export const cancelConstructComponentForProp = () => ({
  type: PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP,
});

/**
 *
 * @type {string}
 * @const
 */
export const PROJECT_SAVE_COMPONENT_FOR_PROP = 'PROJECT_SAVE_COMPONENT_FOR_PROP';

/**
 *
 * @return {Object}
 */
export const saveComponentForProp = () => ({
  type: PROJECT_SAVE_COMPONENT_FOR_PROP,
});

/**
 *
 * @type {string}
 * @const
 */
export const PROJECT_LINK_PROP = 'PROJECT_LINK_PROP';

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {(string|number)[]} [path=[]]
 * @return {Object}
 */
export const linkProp = (componentId, propName, path = []) => ({
  type: PROJECT_LINK_PROP,
  componentId,
  propName,
  path,
});

/**
 *
 * @type {string}
 * @const
 */
export const PROJECT_LINK_WITH_OWNER_PROP = 'PROJECT_LINK_WITH_OWNER_PROP';

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
 * @type {string}
 * @const
 */
export const PROJECT_LINK_PROP_CANCEL = 'PROJECT_LINK_PROP_CANCEL';

/**
 *
 * @return {Object}
 */
export const linkPropCancel = () => ({
  type: PROJECT_LINK_PROP_CANCEL,
});
