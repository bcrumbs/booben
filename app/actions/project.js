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
export const PROJECT_ROUTE_RENAME = 'PROJECT_ROUTE_RENAME';

/**
 *
 * @param {number[]|Immutable.List<number>} where - indexes of routes in path
 * @param {number} idx - index of route to rename
 * @param {string} newTitle
 * @returns {Object}
 */
export const renameRoute = (where, idx, newTitle) => ({
    type: PROJECT_ROUTE_RENAME,
    where,
    idx,
    newTitle
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_UPDATE_PATH = 'PROJECT_ROUTE_UPDATE_PATH';

/**
 *
 * @param {number[]|Immutable.List<number>} where
 * @param {number} idx
 * @param {string} newPath
 * @returns {Object}
 */
export const updateRoutePath = (where, idx, newPath) => ({
    type: PROJECT_ROUTE_UPDATE_PATH,
    where,
    idx,
    newPath
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_UPDATE_DESCRIPTION = 'PROJECT_ROUTE_UPDATE_DESCRIPTION';

/**
 *
 * @param {number[]|Immutable.List<number>} where
 * @param {number} idx
 * @param {string} newDescription
 * @returns {Object}
 */
export const updateRouteDescription = (where, idx, newDescription) => ({
    type: PROJECT_ROUTE_UPDATE_DESCRIPTION,
    where,
    idx,
    newDescription
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_UPDATE_IS_INDEX = 'PROJECT_ROUTE_UPDATE_IS_INDEX';

/**
 *
 * @param {number[]|Immutable.List<number>} where
 * @param {number} idx
 * @param {boolean} newIsIndex
 * @returns {Object}
 */
export const updateRouteIsIndex = (where, idx, newIsIndex) => ({
    type: PROJECT_ROUTE_UPDATE_IS_INDEX,
    where,
    idx,
    newIsIndex
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_COMPONENT_UPDATE = 'PROJECT_ROUTE_COMPONENT_UPDATE';

/**
 *
 * @param {number[]} source - index of source component
 * @param {number[]} target - index of target component
 * @returns {Object}
 */
export const componentUpdateRoute = (source, target) => ({
    type: PROJECT_ROUTE_COMPONENT_UPDATE,
    source,
    target
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_COMPONENT_DELETE = 'PROJECT_ROUTE_COMPONENT_DELETE';

/**
 *
 * @param {number[]} where - index of component
 * @returns {Object}
 */
export const componentDeleteFromRoute = (where) => ({
    type: PROJECT_ROUTE_COMPONENT_DELETE,
    where
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_COMPONENT_ADD_BEFORE = 'PROJECT_ROUTE_COMPONENT_ADD_BEFORE';

/**
 *
 * @param {number[]} where - index of component
 * @returns {Object}
 */
export const componentAddBeforeToRoute = (whereSource) => ({
    type: PROJECT_ROUTE_COMPONENT_ADD_BEFORE,
    whereSource
});

/**
 *
 * @type {string}
 */
export const PROJECT_ROUTE_COMPONENT_ADD_AFTER = 'PROJECT_ROUTE_COMPONENT_ADD_AFTER';

/**
 *
 * @param {number[]} where - index of component
 * @returns {Object}
 */
export const componentAddAfterToRoute = (whereSource) => ({
    type: PROJECT_ROUTE_COMPONENT_ADD_AFTER,
    whereSource
});

