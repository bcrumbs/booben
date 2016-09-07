/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    exec = require('mz/child_process').exec,
    config = require('../../config'),
    gatherMetadata = require('../metadata').gatherMetadata;

const projectsDir = config.get('projectsDir');

/**
 *
 * @param {string} dir
 * @param {string|string[]} modules
 * @returns {Promise}
 */
const npmInstall = (dir, modules) => co(function* () {
    modules = Array.isArray(modules) ? modules : [modules];
    yield exec(`npm install ${modules.join(' ')}`, { cwd: dir });
});

/**
 *
 * @param {Project} project
 * @returns {Promise}
 */
exports.buildComponentsBundle = project => co(function* () {
    const projectDir = path.join(projectsDir, project.name);

    if (project.componentLibs.length > 0)
        yield npmInstall(projectDir, project.componentLibs);


});
