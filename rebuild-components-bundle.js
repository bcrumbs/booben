/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co');
const path = require('path');
const fs = require('mz/fs');
const minimist = require('minimist');
const thenify = require('thenify');
const rimraf = thenify(require('rimraf'));
const { buildComponentsBundle } =
  require('./endpoints/components-bundle-builder');
const config = require('./config');
const constants = require('./common/constants');

const defaults = {
  clean: true,
  'install-loaders': true,
  watch: false,
  'log-npm': false,
  'log-webpack': false,
};

co(function* () {
  const argv = Object.assign(defaults, minimist(process.argv.slice(2)));

  if (!argv._.length) throw new Error('Project name is required');

  const projectName = argv._[0];
  const projectsDir = config.get('projectsDir');
  const projectDir = path.join(projectsDir, projectName);
  const contents = yield fs.readdir(projectDir);
  const skip = [constants.PROJECT_FILE];

  if (!argv['install-loaders']) skip.push('node_modules');

  for (let i = 0, l = contents.length; i < l; i++) {
    if (skip.indexOf(contents[i]) === -1) {
      yield rimraf(path.join(projectDir, contents[i]));
    }
  }

  const project = require(path.join(projectDir, constants.PROJECT_FILE));
  const npmLogger = argv['log-npm'] ? console.log : () => {};

  yield buildComponentsBundle(project, {
    clean: argv.clean,
    noInstallLoaders: !argv['install-loaders'],
    printWebpackOutput: argv['log-webpack'],
    npmLogger,
  });

  process.exit(0);
}).catch(err => {
  console.error(err.message || err.toString());
  process.exit(1);
});
