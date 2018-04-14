const intel = require('intel');
const config = require('../config');

/**
 * @typedef {Object} LoggerConfig
 * @property {string} logLevel
 * @property {boolean} [noTimestamp]

/**
 *
 * @param {LoggerConfig} [config]
 * @returns {Logger}
 */
const getLogger = config => {
  config = config || {};

  if (!config.logLevel) throw new Error('logLevel is required');
  
  const format = config.noTimestamp
    ? '%(levelname)s - %(message)s'
    : '%(date)s - %(levelname)s - %(message)s';

  const consoleHandlerOptions = {
    level: intel[config.logLevel.toUpperCase()],
    formatter: new intel.Formatter({ format }),
  };

  //noinspection JSUnresolvedFunction
  intel.addHandler(new intel.handlers.Console(consoleHandlerOptions));

  return intel.getLogger('main');
};

module.exports = getLogger({
  logLevel: config.get('logLevel'),
  noTimestamp: false,
});
