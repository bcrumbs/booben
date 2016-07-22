'use strict';

/**
 * @ignore
 */
const convict = require('convict'),
    path = require('path');

//noinspection ReservedWordAsName
const config = convict({
    env: {
        doc: 'The application environment.',
        format: ['production', 'development', 'test'],
        default: 'development',
        env: 'NODE_ENV'
    },

    config: {
        doc: 'Custom config file to load',
        format: String,
        default: '',
        arg: 'config'
    },

    projectsDir: {
        doc: 'Projects directory. Default value is for Docker build.',
        format: String,
        default: '/var/lib/jssy/projects'
    }
});

// Load environment dependent configuration
const env = config.get('env');
config.loadFile(path.join(__dirname, 'config', env + '.json'));

// Load custom config file
const customConfigFile = config.get('config');
if (customConfigFile) {
    config.loadFile(customConfigFile);
}

// Perform validation
config.validate({
    strict: true
});

module.exports = config;
