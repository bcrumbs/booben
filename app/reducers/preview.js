'use strict';

import {
    UPDATE_PREVIEW_SELECTED
} from '../actions/preview';

export default (state = {
    selectedItems: []
}, action) => {
    switch (action.type) {
        case UPDATE_PREVIEW_SELECTED: return Object.assign({}, state, {
            selectedItems: action.selectedItems
        });

        default: return state;
    }
};
