/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { getProject, getMetadata } from '../api';
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
    projectName
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
 * @return {Object}
 */
const projectLoaded = (project, metadata) => ({
    type: PROJECT_LOADED,
    project,
    metadata
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
    error
});

/**
 *
 * @param {string} projectName
 * @return {function(dispatch: function(action: Object))}
 */
export const loadProject = projectName => dispatch => {
    dispatch(requestProject(projectName));

    Promise.all([getProject(projectName), getMetadata(projectName)])
        .then(([project, metadata]) => void dispatch(projectLoaded(project, metadata)))
        .catch(err => void dispatch(projectLoadFailed(err)))
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
    title
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
    routeId
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
    newValue
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
    componentId
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_MOVE = 'PROJECT_COMPONENT_MOVE';

/**
 *
 * @param {number} componentId
 * @param {number} targetComponentId
 * @param {number} position
 * @return {Object}
 */
export const moveComponent = (componentId, targetComponentId, position) => ({
    type: PROJECT_COMPONENT_MOVE,
    componentId,
    targetComponentId,
    position
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_CREATE_ROOT = 'PROJECT_COMPONENT_CREATE_ROOT';

/**
 * @param  {number}  routeId
 * @param  {boolean} isIndexRoute
 * @param  {Immutable.Map} components
 * @return {Object}
 */
export const createRootComponent = (routeId, isIndexRoute, components) => ({
    type: PROJECT_COMPONENT_CREATE_ROOT,
    routeId,
    isIndexRoute,
    components
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_CREATE = 'PROJECT_COMPONENT_CREATE';

/**
 * @param  {number} parentComponentId
 * @param  {number} position
 * @param  {Immutable.Map} components
 */
export const createComponent = (parentComponentId, position, components) => ({
    type: PROJECT_COMPONENT_CREATE,
    parentComponentId,
    position,
    components
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_UPDATE_PROP_VALUE = 'PROJECT_COMPONENT_UPDATE_PROP_VALUE';

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {string} newSource
 * @param {SourceDataStatic|SourceDataData|SourceDataConst|SourceDataAction|SourceDataDesigner} newSourceData
 * @return {Object}
 */
export const updateComponentPropValue = (componentId, propName, newSource, newSourceData) => ({
    type: PROJECT_COMPONENT_UPDATE_PROP_VALUE,
    componentId,
    propName,
    newSource,
    newSourceData
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
    newTitle
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
    enable
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
    layoutIdx
});
