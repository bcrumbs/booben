/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    exec = require('mz/child_process').exec,
    fs = require('mz/fs'),
    printObject = require('js-object-pretty-print').pretty,
    webpack = require('webpack'),
    asyncUtils = require('@common/async-utils'),
    config = require('../../config'),
    gatherMetadata = require('../metadata').gatherMetadata,
    constants = require('../../common/constants'),
    logger = require('../../common/logger');

const projectsDir = config.get('projectsDir');

/**
 *
 * @param {string} dir
 * @param {string|string[]} modules
 * @returns {Promise}
 */
const npmInstall = (dir, modules) => co(function* () {
    modules = Array.isArray(modules) ? modules : [modules];
    logger.debug(`Installing ${modules.join(', ')} in ${dir}`);
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
 *
 * @param {string} projectDir
 * @param {LibData[]} libsData
 * @return {Object}
 */
const generateWebpackConfig = (projectDir, libsData) => {
    const localNodeModules = path.join(projectDir, 'node_modules');

    const ret = {
        context: projectDir,
        entry: './' + constants.PROJECT_COMPONENTS_SRC_FILE,
        output: {
            path: path.join(projectDir, constants.PROJECT_COMPONENTS_BUILD_DIR),
            libraryTarget: 'commonjs2'
        },
        externals: ['react', 'react-dom'],
        resolve: {
            modulesDirectories: [localNodeModules],
            extensions: ['', '.js', '.jsx']
        },
        resolveLoader: {
            modulesDirectories: [localNodeModules],
            moduleTemplates: ['*-loader'],
            extensions: ['', '.js']
        },
        module: {
            loaders: [{
                test: path.join(projectDir, constants.PROJECT_COMPONENTS_SRC_FILE),
                loader: 'babel?presets[]=es2015'
            }]
        }
    };

    libsData.forEach(libData => {
        const keys = Object.keys(libData.meta.loaders);
        keys.forEach(key => void ret.module.loaders.push({
            test: new RegExp(key),
            include: libData.dir,
            loaders: libData.meta.loaders[key]
        }));
    });

    return ret;
};

/**
 *
 * @type {Object.<string, function(loaderString: string): string[]>}
 */
const loaderStringParsers = {
    'babel': loaderString => {
        const parts = loaderString.split('?');
        if (parts.length === 1) return [];
        const q = parts[1].split('&').map(str => str.split('='));

        const ret = [];
        q.forEach(qItem => {
            if (qItem[0] === 'presets[]') ret.push(`babel-preset-${qItem[1]}`);
        });

        return ret;
    }
};

/**
 *
 * @param {string} projectDir
 * @param {LibData[]} libsData
 * @returns {Promise}
 */
const installLoaders = (projectDir, libsData) => co(function* () {
    const requiredModulesSet = new Set(),
        loaderModulesSet = new Set();

    // These modules are required to build components.js itself
    requiredModulesSet.add('babel-loader');
    requiredModulesSet.add('babel-preset-es2015');
    loaderModulesSet.add('babel-loader');

    libsData.forEach(libData => {
        const keys = Object.keys(libData.meta.loaders);
        keys.forEach(key => {
            const loaders = libData.meta.loaders[key];
            loaders.forEach(loaderString => {
                const qIdx = loaderString.indexOf('?'),
                    loader = (qIdx === -1 ? loaderString : loaderString.slice(0, qIdx)),
                    loaderModule = loader + '-loader';

                requiredModulesSet.add(loaderModule);
                loaderModulesSet.add(loaderModule);

                const parseLoaderString = loaderStringParsers[loader];
                if (typeof parseLoaderString === 'function')
                    parseLoaderString(loaderString).forEach(module =>
                        void requiredModulesSet.add(module));
            });
        })
    });

    const requiredModules = Array.from(requiredModulesSet.values());
    yield npmInstall(projectDir, requiredModules);

    const loaderModules = Array.from(loaderModulesSet.values()),
        loadersPeerDepsSet = new Set();

    loaderModules.forEach(loaderModule => {
        const packageJSONFile = path.join(
            projectDir,
            'node_modules',
            loaderModule,
            'package.json'
        );

        const packageJSON = require(packageJSONFile);

        if (packageJSON.peerDependencies) {
            const keys = Object.keys(packageJSON.peerDependencies);
            keys.forEach(key => {
                if (key !== 'webpack')
                    loadersPeerDepsSet.add(`${key}@${packageJSON.peerDependencies[key]}`);
            });
        }
    });

    const loadersPeerDeps = Array.from(loadersPeerDepsSet.values());
    if (loadersPeerDeps.length > 0) {
        yield npmInstall(projectDir, loadersPeerDeps);
    }
});

/**
 *
 * @param {Object} webpackConfig
 * @returns {Promise.<Object>}
 */
const compile = webpackConfig => new Promise((resolve, reject) =>
    void webpack(webpackConfig).run((err, stats) =>
        void (err ? reject(err) : resolve(stats))));

/**
 * @typedef {Object} BuildComponentsBundleOptions
 * @property {boolean} [allowMultipleGlobalStyles=false]
 * @property {boolean} [noInstallLoaders=false]
 */

/**
 *
 * @type {BuildComponentsBundleOptions}
 */
const defaultOptions = {
    allowMultipleGlobalStyles: false,
    noInstallLoaders: false
};

/**
 *
 * @param {Project} project
 * @param {BuildComponentsBundleOptions} [options]
 * @returns {Promise}
 */
exports.buildComponentsBundle = (project, options) => co(function* () {
    options = Object.assign({}, defaultOptions, options);

    logger.debug(`Building components bundle for project '${project.name}'`);

    const projectDir = path.join(projectsDir, project.name);

    if (project.componentLibs.length > 0) {
        logger.debug(`[${project.name}] Installing component libraries`);
        yield npmInstall(projectDir, project.componentLibs);
    }

    const modulesDir = path.join(projectDir, 'node_modules');
    let moduleDirs = project.componentLibs.map(name => {
        const atIdx = name.lastIndexOf('@');
        if (atIdx === -1 || atIdx === 0) return name;
        return name.slice(0, atIdx);
    });

    logger.debug(`[${project.name}] Gathering metadata from ${moduleDirs.join(', ')}`);
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

    logger.debug(`[${project.name}] Generating code for components bundle`);
    const code = generateBundleCode(libsData),
        codeFile = path.join(projectDir, constants.PROJECT_COMPONENTS_SRC_FILE);

    yield fs.writeFile(codeFile, code);

    if (!options.noInstallLoaders) {
        logger.verbose(`[${project.name}] Installing webpack loaders`);
        yield installLoaders(projectDir, libsData);
    }

    logger.debug(`[${project.name}] Compiling components bundle`);
    const webpackConfig = generateWebpackConfig(projectDir, libsData),
        stats = yield compile(webpackConfig);

    logger.debug(stats.toString({ colors: true }));

    const webpackLogFile = path.join(
        projectDir,
        constants.PROJECT_COMPONENTS_WEBPACK_LOG_FILE
    );

    try {
        yield fs.writeFile(webpackLogFile, stats.toString({ colors: false }));
    }
    catch (err) {
        logger.warn(`Failed to write webpack log to ${webpackLogFile}: ${err.code}`);
    }
});
