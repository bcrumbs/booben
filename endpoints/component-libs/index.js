/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    exec = require('mz/child_process').exec,
    fs = require('mz/fs'),
    printObject = require('js-object-pretty-print').pretty,
    asyncUtils = require('@common/async-utils'),
    config = require('../../config'),
    gatherMetadata = require('../metadata').gatherMetadata,
    constants = require('../../common/constants');

const projectsDir = config.get('projectsDir');

/**
 *
 * @param {string} dir
 * @param {string|string[]} modules
 * @returns {Promise}
 */
const npmInstall = (dir, modules) => co(function* () {
    modules = Array.isArray(modules) ? modules : [modules];
    yield exec(`npm install -q ${modules.join(' ')}`, { cwd: dir });
});

/**
 * @typedef {Object} LibData
 * @property {string} name
 * @property {string} dir
 * @property {LibMetadata} meta
 */

/**
 *
 * @param {LibData[]} libsData
 * @returns {string}
 */
const generateBundleCode = libsData => {
    let ret = '';

    libsData.forEach(data => {
        if (data.meta.import && data.meta.import.length > 0) {
            data.meta.import.forEach(_import => {
                ret += `import '${data.name}/${_import}';\n`;
            });
        }

        ret += `import * as ${data.meta.namespace} from '${data.name}';\n`;

        const componentNames = Object.keys(data.meta.components);

        componentNames.forEach(componentName => {
            const componentMeta = data.meta.components[componentName];

            ret +=
                `if (${data.meta.namespace}.${componentName}) {\n` +
                `    ${data.meta.namespace}.${componentName}.jssyMeta = (function() {\n` +
                `        return ${printObject(componentMeta)}\n` +
                `    })();\n` +
                `}\n\n`
        });
    });

    ret += `export default { ${ libsData.map(data => data.meta.namespace).join(', ') } }`;

    return ret;
};

/**
 * @typedef {Object} BuildComponentsBundleOptions
 * @property {boolean} [allowMultipleGlobalStyles=false]
 */

/**
 *
 * @type {BuildComponentsBundleOptions}
 */
const defaultOptions = {
    allowMultipleGlobalStyles: false
};

/**
 *
 * @param {Project} project
 * @param {BuildComponentsBundleOptions} options
 * @returns {Promise}
 */
exports.buildComponentsBundle = (project, options) => co(function* () {
    options = Object.assign({}, defaultOptions, options);

    const projectDir = path.join(projectsDir, project.name);

    if (project.componentLibs.length > 0) {
        console.log(`Installing modules ${project.componentLibs.join(', ')} in ${projectDir}`);
        yield npmInstall(projectDir, project.componentLibs);
    }

    const modulesDir = path.join(projectDir, 'node_modules');
    let moduleDirs = project.componentLibs.map(name => {
        const atIdx = name.lastIndexOf('@');
        if (atIdx === -1 || atIdx === 0) return name;
        return name.slice(0, atIdx);
    });

    console.log(`Gathering metadata from ${moduleDirs.join(', ')}`);
    let libsData = yield asyncUtils.asyncMap(moduleDirs, dir => co(function* () {
        const fullPath = path.join(modulesDir, dir),
            meta = yield gatherMetadata(fullPath);

        return meta
            ? { name: dir, dir: fullPath, meta }
            : null;
    }));

    if (!options.allowMultipleGlobalStyles) {
        let libsWithGlobalStylesNum = 0;
        for (let i = 0, l = libsData.length; i < l; i++) {
            if (libsData[i].globalStyle) libsWithGlobalStylesNum++;
            if (libsWithGlobalStylesNum > 1)
                throw new Error(
                    'Multiple component libraries with global styles detected'
                );
        }
    }

    console.log('Generating code');
    const code = generateBundleCode(libsData),
        codeFile = path.join(projectDir, constants.PROJECT_COMPONENTS_SRC_FILE);

    yield fs.writeFile(codeFile, code);

    // TODO: compile components.js with webpack
});
