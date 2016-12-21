/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const convict = require('convict'),
  path = require('path');

convict.addFormat({
  name: 'strings-array',

  validate: val => {
    if (!Array.isArray(val) || val.some(v => typeof v !== 'string'))
      throw new Error('must be an array of strings');
  },

  coerce: val => val.split(',').map(v => v.trim()).filter(v => v !== ''),
});

// noinspection ReservedWordAsName
const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV',
  },

  config: {
    doc: 'Custom config file to load',
    format: String,
    default: '',
    arg: 'config',
  },

  logLevel: {
    doc: 'Logging level',
    format: ['trace', 'verbose', 'debug', 'info', 'warn', 'error', 'critical'],
    default: 'info',
  },

  port: {
    doc: '',
    format: 'port',
    default: 3000,
    env: 'JSSY_PORT',
  },

  serveStatic: {
    doc: '',
    format: Boolean,
    default: false,
    env: 'JSSY_SERVE_STATIC',
  },

  projectsDir: {
    doc: 'Projects directory. Default value is for Docker build.',
    format: String,
    default: '/var/lib/jssy/projects',
    env: 'JSSY_PROJECTS_DIR',
  },

  defaultComponentLibs: {
    doc: '',
    format: 'strings-array',
    default: [],
    env: 'JSSY_DEFAULT_COMPONENT_LIBS',
  },
});

// Load environment dependent configuration
const env = config.get('env');
config.loadFile(path.join(__dirname, 'config', `${env}.json`));

// Load custom config file
const customConfigFile = config.get('config');
if (customConfigFile) config.loadFile(customConfigFile);

// Perform validation
config.validate({
  strict: true,
});

module.exports = config;
