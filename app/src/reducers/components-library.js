import { Record, Set } from 'immutable';

import {
  LIBRARY_EXPANDED_GROUPS,
  LIBRARY_SEARCH,
} from '../actions/components-library';

const LibraryState = Record({
  expandedGroups: Set(),
  searchString: '',
});

const handlers = {
  [LIBRARY_EXPANDED_GROUPS]: (state, action) =>
    state.set('expandedGroups', Set(action.groups)),
  
  [LIBRARY_SEARCH]: (state, action) =>
    state.set('searchString', action.searchString),
};

export default (state = new LibraryState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
