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

export default (state = new LibraryState(), action) => {
  switch (action.type) {
    case LIBRARY_EXPANDED_GROUPS: {
      return state.set('expandedGroups', action.groups);
    }

    default: {
      return state;
    }
  }
};
