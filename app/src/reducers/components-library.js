/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Set } from 'immutable';

import {
    LIBRARY_EXPANDED_GROUPS,
} from '../actions/components-library';

const LibraryState = Record({
  expandedGroups: Set(),
});

const handlers = {
  [LIBRARY_EXPANDED_GROUPS]: (state, action) =>
    state.set('expandedGroups', action.groups),
};

export default (state = new LibraryState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
