/**
 * @author Dmitriy Bizyaev
 */

'use strict';

const intel = require('intel'),
  config = require('../config');

/**
 * @typedef {Object} LoggerConfig
 * @property {string} logLevel
 * @property {boolean} [noTimestamp]

/**
 *
 * @type {?Logger}
 */
let logger = null;

/**
 *
 * @param {LoggerConfig} [config]
 * @returns {Logger}
 */
const getLogger = config => {
  if (logger) return logger;

  config = config || {};

  if (!config.logLevel) throw new Error('logLevel is required');

  const format = config.noTimestamp
        ? '%(levelname)s - %(message)s'
        : '%(date)s - %(levelname)s - %(message)s';

  const consoleHandlerOptions = {
    level: intel[config.logLevel.toUpperCase()],
    formatter: new intel.Formatter({ format }),
  };

  intel.addHandler(new intel.handlers.Console(consoleHandlerOptions));

  return logger = intel.getLogger('main');
};

module.exports = getLogger({
  logLevel: config.get('logLevel'),
  noTimestamp: false,
});
