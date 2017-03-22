/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {Symbol}
 */
export const NO_VALUE = Symbol('NO_VALUE');

/**
 *
 * @type {string}
 */
export const FUNCTION_FNS_ARG_NAME = 'fns';

/**
 *
 * @type {Object<string, PropTypeDefinition>}
 */
export const SYSTEM_PROPS = {
  visible: {
    type: 'bool',
    source: ['static', 'data'],
    sourceConfigs: {
      static: {
        default: true,
      },
      data: {},
    },
  },
};
