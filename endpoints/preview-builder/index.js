/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    thenify = require('thenify'),
    path = require('path'),
    exec = require('mz/child_process').exec,
    fs = require('mz/fs'),
    ncp = thenify(require('ncp').ncp),
    rmrf = thenify(require('rimraf')),
    printObject = require('js-object-pretty-print').pretty,
    webpack = require('webpack'),
    HtmlWebpackPlugin = require('html-webpack-plugin'),
    asyncUtils = require('@common/async-utils'),
    config = require('../../config'),
    gatherMetadata = require('../metadata').gatherMetadata,
    constants = require('../../common/constants'),
    logger = require('../../common/logger');

/**
 *
 * @type {string}
 */
const projectsDir = config.get('projectsDir');

/**
 * @type {string}
 */
const previewSrcDir = path.resolve(path.join(__dirname, '..', '..', 'preview'));

/**
 *
 * @param {string} dir
 * @param {string|string[]} modules
 * @param {Object} [options]
 * @param {boolean} [options.legacyBundling=false]
 * @returns {Promise}
 */
const npmInstall = (dir, modules, options) => co(function* () {
    modules = Array.isArray(modules) ? modules : [modules];
    options = options || {};

    logger.debug(`Installing ${modules.join(', ')} in ${dir}`);

    const cmd =
        `npm install -q ` +
        `${options.legacyBundling ? ' --legacy-bundling' : ''} ` +
        `${modules.join(' ')}`;

    yield exec(cmd, { cwd: dir });
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
                `        return ${printObject(componentMeta, 4, 'json')}\n` +
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
    const projectNodeModules = path.join(projectDir, 'node_modules'),
        localNodeModules = path.resolve(__dirname, '..', '..', 'node_modules');

    const rewriteComponentsPathResolverPlugin = {
        apply(resolver) {
            resolver.plugin('resolve', (context, request) => {
                const isComponentsFile =
                    /preview(\/|\\)components$/.test(context) &&
                    request.path === '../components.js';

                if (isComponentsFile)
                    request.path = path.resolve(projectDir, 'components.js');
            });
        }
    };

    const ret = {
        context: path.resolve(__dirname, '..', '..', 'preview'),
        entry: './index',

        output: {
            path: path.join(projectDir, constants.PROJECT_PREVIEW_BUILD_DIR)
        },

        resolve: {
            root: [projectNodeModules],
            modulesDirectories: ['node_modules'],
            fallback: [localNodeModules],
            extensions: ['', '.js', '.jsx']
        },

        resolveLoader: {
            root: [
                projectNodeModules,
                localNodeModules
            ],
            moduleTemplates: ['*-loader'],
            extensions: ['', '.js']
        },

        plugins: [
            {
                apply(compiler) {
                    compiler.resolvers.normal.apply(rewriteComponentsPathResolverPlugin)
                }
            },

            new HtmlWebpackPlugin({
                template: 'index.ejs',
                inject: 'body',
                hash: true
            })
        ],

        module: {
            loaders: [{
                test: filename =>
                    filename.indexOf('node_modules') === -1 &&
                    (filename.endsWith('.js') || filename.endsWith('.jsx')),

                loader: 'babel?presets[]=es2015&presets[]=react'
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
 *
 * @param {string} projectDir
 * @returns {Promise}
 */
const clean = projectDir => co(function* () {
    const previewSourceFiles = yield fs.readdir(previewSrcDir);

    const toDelete = [].concat(
        path.join(projectDir, 'node_modules'),
        previewSourceFiles.map(file => path.join(projectDir, file))
    );

    for (let i = 0, l = toDelete.length; i < l; i++) yield rmrf(toDelete[i]);
});

/**
 * @typedef {Object} BuildPreviewAppOptions
 * @property {boolean} [allowMultipleGlobalStyles=false]
 * @property {boolean} [noInstallLoaders=false]
 * @property {boolean} [clean=true]
 */

/**
 *
 * @type {BuildPreviewAppOptions}
 */
const defaultOptions = {
    allowMultipleGlobalStyles: false,
    noInstallLoaders: false,
    clean: true
};

/**
 *
 * @param {Project} project
 * @param {BuildPreviewAppOptions} [options]
 * @returns {Promise}
 */
exports.buildPreviewApp = (project, options) => co(function* () {
    options = Object.assign({}, defaultOptions, options);

    const projectDir = path.join(projectsDir, project.name);

    if (project.componentLibs.length > 0) {
        logger.debug(`[${project.name}] Installing component libraries`);
        yield npmInstall(projectDir, project.componentLibs, { legacyBundling: true });
    }

    const modulesDir = path.join(projectDir, 'node_modules');
    let libDirs = project.componentLibs.map(name => {
        const atIdx = name.lastIndexOf('@');
        if (atIdx === -1 || atIdx === 0) return name;
        return name.slice(0, atIdx);
    });

    logger.debug(`[${project.name}] Gathering metadata from ${libDirs.join(', ')}`);
    let libsData = yield asyncUtils.asyncMap(libDirs, dir => co(function* () {
        const fullPath = path.join(modulesDir, dir),
            meta = yield gatherMetadata(fullPath);

        return meta
            ? { name: dir, dir: fullPath, meta }
            : null;
    }));

    libsData = libsData.filter(libData => libData !== null);

    const compiledMetadata = libsData.reduce((acc, cur) =>
        Object.assign(acc, { [cur.meta.namespace]: cur.meta }), {});

    const compiledMetadataFile = path.join(
        projectDir,
        constants.PROJECT_COMPILED_METADATA_FILE
    );

    logger.debug(`[${project.name}] Saving compiled metadata file`);
    yield fs.writeFile(compiledMetadataFile, JSON.stringify(compiledMetadata));

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

    if (!options.noInstallLoaders) {
        logger.debug(`[${project.name}] Installing webpack loaders`);
        yield installLoaders(projectDir, libsData);
    }

    logger.debug(`[${project.name}] Generating code for components bundle`);
    const code = generateBundleCode(libsData),
        codeFile = path.join(projectDir, constants.PROJECT_COMPONENTS_SRC_FILE);

    yield fs.writeFile(codeFile, code);

    logger.debug(`[${project.name}] Compiling preview app`);
    const webpackConfig = generateWebpackConfig(projectDir, libsData),
        stats = yield compile(webpackConfig);

    logger.verbose(stats.toString({ colors: true }));

    const webpackLogFile = path.join(
        projectDir,
        constants.PROJECT_PREVIEW_WEBPACK_LOG_FILE
    );

    try {
        yield fs.writeFile(webpackLogFile, stats.toString({ colors: false }));
    }
    catch (err) {
        logger.warn(`Failed to write webpack log to ${webpackLogFile}: ${err.code}`);
    }

    if (options.clean) {
        logger.debug(`[${project.name}] Cleaning ${projectDir}`);
        yield clean(projectDir);
    }
});
