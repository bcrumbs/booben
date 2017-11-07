/**
 * @author Dmitriy Bizyaev
 */

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
    required: true,
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

/**
 *
 * @type {JssyValueDefinition}
 */
export const ROUTE_PARAM_VALUE_DEF = {
  type: 'string',
  required: true,
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

/**
 *
 * @type {JssyValueDefinition}
 */
export const AJAX_URL_VALUE_DEF = {
  type: 'string',
  required: true,
  source: ['static', 'data', 'state', 'actionArg'],
  sourceConfigs: {
    static: {
      default: '',
    },
    data: {},
    state: {},
    actionArg: {},
  },
};

/**
 *
 * @type {JssyValueDefinition}
 */
export const AJAX_BODY_VALUE_DEF = {
  type: 'any',
  required: false,
  source: ['static', 'data', 'state', 'routeParams', 'actionArg'],
  sourceConfigs: {
    static: {
      default: '',
    },
    data: {},
    state: {},
    routeParams: {},
    actionArg: {},
  },
};

export const APOLLO_STATE_KEY = 'apollo';
