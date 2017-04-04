/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, List, Map } from 'immutable';

export const MutationActionParams = Record({
  mutation: '',
  args: Map(),
  successActions: List(),
  errorActions: List(),
});

export const NavigateActionParams = Record({
  routeId: -1,
  routeParams: Map(),
});

export const URLActionParams = Record({
  url: '',
  newWindow: true,
});

export const MethodCallActionParams = Record({
  componentId: -1,
  method: '',
  args: List(),
});

export const PropChangeActionParams = Record({
  componentId: -1,
  propName: '',
  systemPropName: '',
  value: null,
});

export const createActionParams = type => {
  switch (type) {
    case 'mutation': return new MutationActionParams();
    case 'navigate': return new NavigateActionParams();
    case 'url': return new URLActionParams();
    case 'method': return new MethodCallActionParams();
    case 'prop': return new PropChangeActionParams();
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

Action.isValidPathStep = (step, current) => {
  if (current.type === 'mutation')
    return VALID_PATH_STEPS_MUTATION.has(step);
  else if (current.type === 'method')
    return VALID_PATH_STEPS_METHOD.has(step);
  else if (current.type === 'navigate')
    return VALID_PATH_STEPS_NAVIGATE.has(step);
  else if (current.type === 'prop')
    return VALID_PATH_STEPS_PROP.has(step);
  else
    return false;
};

Action.expandPathStep = step => step;

export default Record({
  actions: List(),
});
