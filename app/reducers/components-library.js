/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { LIBRARY_EXPANDED_GROUPS } from '../actions/components-library';

import { Record, Set } from 'immutable';

const LibraryState = Record({
    expandedGroups: Set()
});

export default (state = new LibraryState(), action) => {
    switch (action.type) {
        case LIBRARY_EXPANDED_GROUPS:
            return state.set('expandedGroups', action.groups);

        default:
            return state;
    }
};
