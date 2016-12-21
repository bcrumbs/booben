/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const co = require('co'),
  fs = require('mz/fs'),
  path = require('path'),
  minimist = require('minimist'),
  gatherMetadata = require('./endpoints/metadata').gatherMetadata;

co(function* () {
  const argv = minimist(process.argv.slice(2));
  if (!argv._.length) throw new Error('Path is required');

  const libraryPath = path.resolve(process.cwd(), argv._[0]);

  if (!(yield fs.exists(libraryPath)))
    throw new Error(`${libraryPath} does not exist`);

  const stats = yield fs.stat(libraryPath);

  if (!stats.isDirectory())
    throw new Error(`${libraryPath} is not a directory`);

  yield gatherMetadata(libraryPath);
  console.log(`Metadata is OK in ${libraryPath}`);
  process.exit();
}).catch(err => {
  let message = err.message || err.toString();
  if (err.validationErrors) {
    message +=
            `\nValidation errors:\n${
            err.validationErrors.map(e => JSON.stringify(e)).join('\n')}`;
  }

  console.error(message);
  process.exit(1);
});
