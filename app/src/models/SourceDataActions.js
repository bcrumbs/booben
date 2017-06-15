/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';
import { INVALID_ID } from '../constants/misc';

export const MutationActionParams = Record({
  mutation: '',
  args: Map(), // Map of JssyValues
  successActions: List(), // List of Actions
  errorActions: List(), // List of Actions
});

export const NavigateActionParams = Record({
  routeId: INVALID_ID,
  routeParams: Map(), // Map of JssyValues
});

export const URLActionParams = Record({
  url: '',
  newWindow: true,
});

export const MethodCallActionParams = Record({
  componentId: INVALID_ID,
  method: '',
  args: List(), // List of JssyValues
});

export const PropChangeActionParams = Record({
  componentId: INVALID_ID,
  propName: '',
  systemPropName: '',
  value: null, // JssyValue
});

export const AJAXActionParams = Record({
  url: '',
  method: 'GET',
  body: null, // JssyValue
  headers: Map(),
  json: false,
  nextActions: List(), // List of Actions
});

export const createActionParams = type => {
  switch (type) {
    case 'mutation': return new MutationActionParams();
    case 'navigate': return new NavigateActionParams();
    case 'url': return new URLActionParams();
    case 'method': return new MethodCallActionParams();
    case 'prop': return new PropChangeActionParams();
    case 'logout': return null;
    case 'ajax': return new AJAXActionParams();
    default: return null;
  }
};

export const Action = Record({
  type: '',
  params: null,
});

const VALID_PATH_STEPS_MUTATION =
  new Set(['args', 'successActions', 'errorActions']);

const VALID_PATH_STEPS_METHOD = new Set(['args']);
const VALID_PATH_STEPS_NAVIGATE = new Set(['routeParams']);
const VALID_PATH_STEPS_PROP = new Set(['value']);
const VALID_PATH_STEPS_AJAX = new Set(['body']);

Action.isValidPathStep = (step, current) => {
  if (current.type === 'mutation') {
    return VALID_PATH_STEPS_MUTATION.has(step);
  } else if (current.type === 'method') {
    return VALID_PATH_STEPS_METHOD.has(step);
  } else if (current.type === 'navigate') {
    return VALID_PATH_STEPS_NAVIGATE.has(step);
  } else if (current.type === 'prop') {
    return VALID_PATH_STEPS_PROP.has(step);
  } else if (current.type === 'ajax') {
    return VALID_PATH_STEPS_AJAX.has(step);
  } else {
    return false;
  }
};

Action.expandPathStep = step => ['params', step];

export default Record({
  actions: List(),
});
