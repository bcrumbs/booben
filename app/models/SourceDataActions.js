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
  newWindow: false,
});

export const Action = Record({
  type: 'noop',
  params: null,
});

export default Record({
  actions: List(),
});
