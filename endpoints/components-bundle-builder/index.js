/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co');
const thenify = require('thenify');
const path = require('path');
const exec = require('mz/child_process').exec;
const fs = require('mz/fs');
const rmrf = thenify(require('rimraf'));
const webpack = require('webpack');
const asyncUtils = require('@common/async-utils');
const config = require('../../config');
const gatherMetadata = require('@jssy/metadata').gatherMetadata;
const constants = require('../../common/constants');
const logger = require('../../common/logger');

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
 * @param {Function} [options.log]
 * @returns {Promise}
 */
const npmInstall = (dir, modules, options) => co(function* () {
  modules = Array.isArray(modules) ? modules : [modules];
  const _options = options || {};

  logger.debug(`Installing ${modules.join(', ')} in ${dir}`);

  const cmd =
    'npm install -q ' +
    `${_options.legacyBundling ? ' --legacy-bundling' : ''} ` +
    `${modules.join(' ')}`;

  const [stdout, stderr] = yield exec(cmd, { cwd: dir });

  if (_options.log) {
    if (stdout) {
      _options.log('NPM output:');
      _options.log(stdout);
    }
    if (stderr) {
      _options.log('NPM errors:');
      _options.log(stderr);
    }
  }
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
  });

  ret +=
    'export default { ' +
    `${libsData.map(data => data.meta.namespace).join(', ')}` +
    ' }';

  return ret;
};

/**
 *
 * @param {string} projectDir
 * @param {LibData[]} libsData
 * @return {Object}
 */
const generateWebpackConfig = (projectDir, libsData) => {
  const ret = {
    context: projectDir,

    entry: {
      components: './components',
    },

    externals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      'prop-types': 'PropTypes',
    },

    output: {
      path: path.join(projectDir, 'build'),
      library: 'JssyComponents',
      libraryTarget: 'var',
    },

    resolve: {
      modulesDirectories: ['node_modules'],
      extensions: ['', '.js', '.jsx'],
    },

    resolveLoader: {
      moduleTemplates: ['*-loader'],
      extensions: ['', '.js'],
    },

    module: {
      loaders: [{
        test: filename =>
          filename.indexOf('node_modules') === -1 &&
          (filename.endsWith('.js') || filename.endsWith('.jsx')),

        loader: 'babel?presets[]=es2015',
      }],
    },
  };

  libsData.forEach(libData => {
    const keys = Object.keys(libData.meta.loaders);
    keys.forEach(key => void ret.module.loaders.push({
      test: new RegExp(key),
      include: libData.dir,
      loaders: libData.meta.loaders[key],
    }));
  });

  return ret;
};

/**
 *
 * @type {Object.<string, function(loaderString: string): string[]>}
 */
const loaderStringParsers = {
  /* eslint-disable quote-props */
  'babel': loaderString => {
    const parts = loaderString.split('?');
    if (parts.length === 1) return [];
    const q = parts[1].split('&').map(str => str.split('='));

    const ret = [];
    q.forEach(([key, value]) => {
      if (key === 'presets[]') ret.push(`babel-preset-${value}`);
      else if (key === 'plugins[]') ret.push(`babel-plugin-${value}`);
    });

    return ret;
  },
  /* eslint-enable quote-props */
};

/**
 *
 * @param {string} projectDir
 * @param {LibData[]} libsData
 * @param {Object} [options]
 * @param {Function} [options.npmLogger]
 * @returns {Promise}
 */
const installLoaders = (projectDir, libsData, options) => co(function* () {
  options = options || {};

  const requiredModulesSet = new Set(),
    loaderModulesSet = new Set();

  libsData.forEach(libData => {
    const keys = Object.keys(libData.meta.loaders);
    
    keys.forEach(key => {
      const loaders = libData.meta.loaders[key];
      loaders.forEach(loaderString => {
        const qIdx = loaderString.indexOf('?'),
          loader = (qIdx === -1 ? loaderString : loaderString.slice(0, qIdx)),
          loaderModule = `${loader}-loader`;

        requiredModulesSet.add(loaderModule);
        loaderModulesSet.add(loaderModule);

        const parseLoaderString = loaderStringParsers[loader];
        if (typeof parseLoaderString === 'function') {
          parseLoaderString(loaderString)
            .forEach(module => void requiredModulesSet.add(module));
        }
      });
    });
  });

  const requiredModules = Array.from(requiredModulesSet.values());
  yield npmInstall(projectDir, requiredModules, { log: options.npmLogger });

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
        if (key !== 'webpack') {
          const arg = `${key}@"${packageJSON.peerDependencies[key]}"`;
          loadersPeerDepsSet.add(arg);
        }
      });
    }
  });

  const loadersPeerDeps = Array.from(loadersPeerDepsSet.values());
  if (loadersPeerDeps.length > 0)
    yield npmInstall(projectDir, loadersPeerDeps, { log: options.npmLogger });
});

const cb = (resolve, reject) =>
  (err, res) => void (err ? reject(err) : resolve(res));

/**
 *
 * @param {Object} webpackConfig
 * @returns {Promise.<Object>}
 */
const compile = webpackConfig => new Promise((resolve, reject) =>
  void webpack(webpackConfig).run(cb(resolve, reject)));

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
 * @property {Function} [npmLogger]
 */

/**
 *
 * @type {BuildPreviewAppOptions}
 */
const defaultOptions = {
  allowMultipleGlobalStyles: false,
  noInstallLoaders: false,
  clean: true,
  npmLogger: () => {},
};

/**
 *
 * @param {Project} project
 * @param {BuildPreviewAppOptions} [options]
 * @returns {Promise}
 */
exports.buildComponentsBundle = (project, options) => co(function* () {
  options = Object.assign({}, defaultOptions, options);

  const projectDir = path.join(projectsDir, project.name);

  if (project.componentLibs.length > 0) {
    logger.debug(`[${project.name}] Installing component libraries`);
    yield npmInstall(projectDir, project.componentLibs, {
      legacyBundling: true,
      log: options.npmLogger,
    });
  }

  const modulesDir = path.join(projectDir, 'node_modules');
  const libDirs = project.componentLibs.map(name => {
    const atIdx = name.lastIndexOf('@');
    if (atIdx === -1 || atIdx === 0) return name;
    return name.slice(0, atIdx);
  });

  logger.debug(
    `[${project.name}] Gathering metadata from ${libDirs.join(', ')}`
  );
  
  let libsData = yield asyncUtils.asyncMap(libDirs, dir => co(function* () {
    const fullPath = path.join(modulesDir, dir);
    const meta = yield gatherMetadata(fullPath);

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
      if (libsWithGlobalStylesNum > 1) {
        throw new Error(
          'Multiple component libraries with global styles detected'
        );
      }
    }
  }

  if (!options.noInstallLoaders) {
    logger.debug(`[${project.name}] Installing webpack loaders`);
    yield installLoaders(
      projectDir,
      libsData,
      { npmLogger: options.npmLogger }
    );
  }

  logger.debug(`[${project.name}] Generating code for components bundle`);
  const code = generateBundleCode(libsData);
  const codeFile = path.join(projectDir, constants.PROJECT_COMPONENTS_SRC_FILE);
  yield fs.writeFile(codeFile, code);

  logger.debug(`[${project.name}] Compiling preview app`);

  const webpackConfig = generateWebpackConfig(projectDir, libsData);
  const stats = yield compile(webpackConfig);
  
  logger.verbose(stats.toString({ colors: true }));
  
  const webpackLogFile = path.join(
    projectDir,
    constants.PROJECT_PREVIEW_WEBPACK_LOG_FILE
  );
  
  try {
    yield fs.writeFile(webpackLogFile, stats.toString({ colors: false }));
  } catch (err) {
    logger.warn(
      `Failed to write webpack log to ${webpackLogFile}: ${err.code}`
    );
  }
  
  if (options.clean) {
    logger.debug(`[${project.name}] Cleaning ${projectDir}`);
    yield clean(projectDir);
  }
  
  return null;
});

exports.cleanProjectDir = projectName => co(function* () {
  const projectDir = path.join(projectsDir, projectName);
  yield clean(projectDir);
});
