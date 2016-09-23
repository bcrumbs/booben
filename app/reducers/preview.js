'use strict';

import { Record, List } from 'immutable';

import {
    UPDATE_PREVIEW_SELECTED,
    UPDATE_PREVIEW_HIGHLIGHTED
} from '../actions/preview';

import { Preview } from '../models';

const PreviewState = Record({
    selectedItems: List(),
    highlightedItems: List()
});

export default (state = new PreviewState(), action) => {
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
