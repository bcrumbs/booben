const co = require('co');
const npa = require('npm-package-arg');
const thenify = require('thenify');
const path = require('path');
const exec = require('mz/child_process').exec;
const fs = require('mz/fs');
const rmrf = thenify(require('rimraf'));
const prettyMs = require('pretty-ms');
const webpack = require('webpack');
const asyncUtils = require('booben-async-utils');
const config = require('../../config');
const gatherMetadata = require('booben-metadata').gatherMetadata;
const constants = require('../../common/constants');
const logger = require('../../common/logger');
const { URL_BUNDLE_PREFIX } = require('../../shared/constants');

/**
 *
 * @type {string}
 */
const projectsDir = config.get('projectsDir');

/**
 *
 * @param {string} dir
 * @param {Object} [options]
 * @param {boolean} [options.legacyBundling=false]
 * @param {Function} [options.log]
 * @returns {Promise}
 */
const npmInit = (dir, options) => co(function* () {
  const _options = options || {};
  logger.debug(`init package.json in ${dir}`);
  const cmd = 'npm init -y';
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
 * @param {boolean} [usingStyledComponents=false]
 * @returns {string}
 */
const generateBundleCode = (libsData, usingStyledComponents = false) => {
  let ret = '';

  if (usingStyledComponents) {
    ret += 'import __styled_components__ from \'styled-components\';\n';
  }

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
    ' };\n';

  if (usingStyledComponents) {
    ret += 'export const styled = __styled_components__;\n';
  }

  return ret;
};

/**
 *
 * @param {string} projectName
 * @param {string} projectDir
 * @param {LibData[]} libsData
 * @return {Object}
 */
const generateWebpackConfig = (projectName, projectDir, libsData) => {
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
      filename: '[name].js',
      library: 'JssyComponents',
      libraryTarget: 'var',
      publicPath: `${URL_BUNDLE_PREFIX}/${projectName}/`,
    },

    resolve: {
      modules: ['node_modules'],
      extensions: ['.js', '.jsx'],
    },

    resolveLoader: {
      modules: ['node_modules'],
      extensions: ['.js'],
    },

    module: {
      rules: [{
        test: filename =>
          filename.indexOf('node_modules') === -1 &&
          (filename.endsWith('.js') || filename.endsWith('.jsx')),

        loader: 'babel-loader',
        options: {
          presets: ['es2015'],
        },
      }],
    },
  };

  libsData.forEach(libData => {
    const keys = Object.keys(libData.meta.loaders);
    keys.forEach(key => {
      const rule = {
        test: new RegExp(key),
        include: libData.dir,
      };

      const loaders = libData.meta.loaders[key];

      if (loaders.length === 1) {
        if (typeof loaders[0] === 'string') {
          rule.loader = loaders[0];
        } else {
          rule.loader = loaders[0].loader;
          if (loaders[0].options) rule.options = loaders[0].options;
        }
      } else {
        rule.use = loaders;
      }

      ret.module.rules.push(rule);
    });
  });

  return ret;
};

/**
 *
 * @type {Object.<string, function(loaderConfig: string|object): string[]>}
 */
const loaderConfigParsers = {
  /* eslint-disable quote-props */
  'babel-loader': loaderConfig => {
    const ret = [];

    if (typeof loaderConfig === 'object' && loaderConfig.options) {
      if (loaderConfig.options.presets) {
        loaderConfig.options.presets.forEach(preset => {
          ret.push(`babel-preset-${preset}`);
        });
      }

      if (loaderConfig.options.plugins) {
        loaderConfig.options.plugins.forEach(plugin => {
          ret.push(`babel-plugin-${plugin}`);
        });
      }
    }

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

  const requiredModulesSet = new Set();
  const loaderModulesSet = new Set();

  libsData.forEach(libData => {
    const keys = Object.keys(libData.meta.loaders);

    keys.forEach(key => {
      const loaders = libData.meta.loaders[key];
      loaders.forEach(loaderConfig => {
        const loader = typeof loaderConfig === 'string'
          ? loaderConfig
          : loaderConfig.loader;

        requiredModulesSet.add(loader);
        loaderModulesSet.add(loader);

        const parseLoaderConfig = loaderConfigParsers[loader];
        if (typeof parseLoaderConfig === 'function') {
          parseLoaderConfig(loaderConfig)
            .forEach(module => void requiredModulesSet.add(module));
        }
      });
    });
  });

  const requiredModules = Array.from(requiredModulesSet.values());
  yield npmInstall(projectDir, requiredModules, { log: options.npmLogger });

  const loaderModules = Array.from(loaderModulesSet.values());
  const loadersPeerDepsSet = new Set();

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
  if (loadersPeerDeps.length > 0) {
    yield npmInstall(projectDir, loadersPeerDeps, { log: options.npmLogger });
  }
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
  const toDelete = [
    path.join(projectDir, 'node_modules'),
    path.join(projectDir, constants.PROJECT_COMPONENTS_SRC_FILE),
  ];

  for (let i = 0, l = toDelete.length; i < l; i++) {
    yield rmrf(toDelete[i]);
  }
});

/**
 * @typedef {Object} BuildPreviewAppOptions
 * @property {boolean} [allowMultipleGlobalStyles=false]
 * @property {boolean} [noInstallLoaders=false]
 * @property {boolean} [clean=true]
 * @property {boolean} [printWebpackOutput=false]
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
  printWebpackOutput: false,
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

  const startTime = Date.now();
  const projectDir = path.join(projectsDir, project.name);
  const usingStyledComponents = project.enableHTML;

  // Prevents installation problem for macOS developers
  yield npmInit(projectDir, {
    log: options.npmLogger,
  });

  if (project.componentLibs.length > 0) {
    logger.debug(`[${project.name}] Installing component libraries`);

    yield npmInstall(projectDir, project.componentLibs, {
      legacyBundling: true,
      log: options.npmLogger,
    });
  }

  if (usingStyledComponents) {
    logger.debug(`[${project.name}] Installing styled-components`);

    yield npmInstall(projectDir, 'styled-components', {
      log: options.npmLogger,
    });
  }

  const modulesDir = path.join(projectDir, 'node_modules');
  const libDirs = project.componentLibs.map(lib => {
    const { name } = npa(lib);
    return name.replace('-meta', '');
  });

  logger.debug(
    `[${project.name}] Gathering metadata from ${libDirs.join(', ')}`
  );

  let libsData = yield asyncUtils.asyncMap(libDirs, dir => co(function* () {
    const metaDir = `${dir}-meta`;
    const fullPath = path.join(modulesDir, metaDir);
    const meta = yield gatherMetadata(fullPath);

    if (!meta) {
      throw new Error(`Failed to get metadata for ${dir}`);
    }

    return { name: dir, dir: fullPath, meta };
  }));

  yield asyncUtils.asyncForEach(libsData, ({ name, dir }) => co(function* () {
    const packageJSONPath = path.join(dir, 'package.json');
    const packageJSON = require(packageJSONPath);

    if (packageJSON.peerDependencies) {
      const peerDeps = Object.keys(packageJSON.peerDependencies)
        .filter(moduleName =>
          ['react', 'react-dom', 'prop-types'].indexOf(moduleName) === -1);

      if (peerDeps.length > 0) {
        logger.debug(
          `[${project.name}] Installing peer dependencies of ${name}`
        );

        const toInstall = peerDeps.map(moduleName =>
          `${moduleName}@"${packageJSON.peerDependencies[moduleName]}"`);

        yield npmInstall(projectDir, toInstall, {
          legacyBundling: true,
          log: options.npmLogger,
        });
      }
    }
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
  const code = generateBundleCode(libsData, usingStyledComponents);
  const codeFile = path.join(projectDir, constants.PROJECT_COMPONENTS_SRC_FILE);
  yield fs.writeFile(codeFile, code);

  logger.debug(`[${project.name}] Building bundle`);

  const webpackConfig = generateWebpackConfig(
    project.name,
    projectDir,
    libsData
  );

  const stats = yield compile(webpackConfig);

  if (options.printWebpackOutput) {
    logger.debug(stats.toString({ colors: true }));
  }

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

  // if (options.clean) {
  //   logger.debug(`[${project.name}] Cleaning ${projectDir}`);
  //   yield clean(projectDir);
  // }

  const buildTime = Date.now() - startTime;
  logger.debug(`[${project.name}] Build finished in ${prettyMs(buildTime)}`);

  return null;
});

exports.cleanProjectDir = projectName => co(function* () {
  const projectDir = path.join(projectsDir, projectName);
  yield clean(projectDir);
});
