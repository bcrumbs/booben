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

export default Record({
  actions: List(),
});
