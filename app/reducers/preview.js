'use strict';

import {
    UPDATE_PREVIEW_SELECTED,
    UPDATE_PREVIEW_HIGHLIGHTED
} from '../actions/preview';

export default (state = {
    selectedItems: []
}, action) => {
    switch (action.type) {
        case UPDATE_PREVIEW_SELECTED: return Object.assign({}, state, {
            selectedItems: action.selectedItems
        });

        case UPDATE_PREVIEW_HIGHLIGHTED: return Object.assign({}, state, {
            highlightedItems: action.highlightedItems
        });

        default: return state;
    }
};
