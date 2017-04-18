/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {Object<string, Project>}
 */
const cache = {};

/**
 *
 * @param {string} projectName
 * @return {?Project}
 */
exports.getProjectFromCache = projectName => cache[projectName] || null;

/**
 *
 * @param {string} projectName
 * @param {Project} project
 */
exports.putProjectToCache = (projectName, project) => {
  cache[projectName] = project;
};
