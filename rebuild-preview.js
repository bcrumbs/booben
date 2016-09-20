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

co(function* () {
    const argv = minimist(process.argv.slice(2));

    if (!argv._.length) throw new Error('Project name is required');

    const projectName = argv._[0],
        projectsDir = config.get('projectsDir'),
        projectDir = path.join(projectsDir, projectName);

    const contents = yield fs.readdir(projectDir);

    for (let i = 0, l = contents.length; i < l; i++) {
        if (contents[i] !== constants.PROJECT_FILE)
            yield rimraf(path.join(projectDir, contents[i]));
    }

    const project = require(path.join(projectDir, constants.PROJECT_FILE));

    yield buildPreviewApp(project, { clean: !argv['no-cleanup'] });
}).catch(err => {
    console.error(err.message || err.toString());
    process.exit(1);
});
