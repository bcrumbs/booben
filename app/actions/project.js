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
