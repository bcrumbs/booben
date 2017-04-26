/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {number}
 */
export const INVALID_ID = -1;

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
 * @type {Object<string, JssyValueDefinition>}
 */
export const SYSTEM_PROPS = {
  visible: {
    type: 'bool',
    source: ['static', 'data', 'state'],
    sourceConfigs: {
      static: {
        default: true,
      },
      data: {},
      state: {},
    },
  },
};

export const ROUTE_PARAM_VALUE_DEF = {
  type: 'string',
  source: ['static', 'data', 'state', 'routeParams'],
  sourceConfigs: {
    static: {
      default: '',
    },
    data: {},
    state: {},
    routeParams: {},
  },
};
