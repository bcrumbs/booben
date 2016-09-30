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
 * @param {number[]} where - indexes of routes in path
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
