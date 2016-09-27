/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
    path = require('path'),
    fs = require('mz/fs'),
    minimist = require('minimist'),
    thenify = require('thenify'),
    rimraf = thenify(require('rimraf')),
    buildPreviewApp = require('./endpoints/preview-builder').buildPreviewApp,
    config = require('./config'),
    constants = require('./common/constants');

const defaults = {
    'clean': true,
    'install-loaders': true
};

co(function* () {
    const argv = Object.assign(defaults, minimist(process.argv.slice(2)));

    if (!argv._.length) throw new Error('Project name is required');

    const projectName = argv._[0],
        projectsDir = config.get('projectsDir'),
        projectDir = path.join(projectsDir, projectName);

    const contents = yield fs.readdir(projectDir);

    const skip = [
        constants.PROJECT_FILE
    ];

    if (!argv['install-loaders']) skip.push('node_modules');

    for (let i = 0, l = contents.length; i < l; i++) {
        if (skip.indexOf(contents[i]) === -1)
            yield rimraf(path.join(projectDir, contents[i]));
    }

    const project = require(path.join(projectDir, constants.PROJECT_FILE));

    yield buildPreviewApp(project, {
        clean: argv['clean'],
        noInstallLoaders: !argv['install-loaders']
    });

    process.exit(0);
}).catch(err => {
    console.error(err.message || err.toString());
    process.exit(1);
});
