/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { getProject, getMetadata } from '../api';

/**
 *
 * @type {string}
 */
export const PROJECT_REQUEST = 'PROJECT_REQUEST';

/**
 *
 * @param {string} projectName
 * @returns {Object}
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
 * @returns {Object}
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
 * @returns {Object}
 */
const projectLoadFailed = error => ({
    type: PROJECT_LOAD_FAILED,
    error
});

/**
 *
 * @param {string} projectName
 * @returns {function(dispatch: function(action: Object))}
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
 * @param {number[]} where - indexes of routes in path
 * @param {string} path
 * @param {string} title
 * @returns {Object}
 */
export const createRoute = (where, path, title) => ({
    type: PROJECT_ROUTE_CREATE,
    where,
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
 * @param {number[]} where - indexes of routes in path
 * @param {number} idx - index of route to delete
 * @returns {Object}
 */
export const deleteRoute = (where, idx) => ({
    type: PROJECT_ROUTE_DELETE,
    where,
    idx
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_UPDATE_FIELD = 'PROJECT_ROUTE_UPDATE_FIELD';

/**
 *
 * @param {number[]|Immutable.List<number>} where - indexes of routes in path
 * @param {number} idx - index of route to rename
 * @param {string} field
 * @param {*} newValue
 * @returns {Object}
 */
export const updateRouteField = (where, idx, field, newValue) => ({
    type: PROJECT_ROUTE_UPDATE_FIELD,
    where,
    idx,
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
 * @returns {Object}
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
 * @param {number[]} where - index of component
 * @returns {Object}
 */
export const moveComponent = (sourceId, targetId, position) => ({
    type: PROJECT_COMPONENT_MOVE,
    sourceId,
    targetId,
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
 * @param  {ProjectComponent}  component
 * @return {object}
 */
export const createRootComponent = (routeId, isIndexRoute, component) => ({
    type: PROJECT_COMPONENT_CREATE_ROOT,
    routeId,
    isIndexRoute,
    component
});

/**
 *
 * @type {string}
 */
export const PROJECT_COMPONENT_CREATE = 'PROJECT_COMPONENT_CREATE';

/**
 * @param  {number} targetId
 * @param  {number} position
 * @param  {ProjectComponent} component
 */
export const createComponent = (targetId, position, component) => ({
    type: PROJECT_COMPONENT_CREATE,
    targetId,
    position,
    component
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
