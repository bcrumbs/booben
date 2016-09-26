'use strict';

import { Record, Set } from 'immutable';

import {
    DESELECT_PREVIEW_COMPONENT,
    SELECT_PREVIEW_COMPONENT,
    HIGHLIGHT_PREVIEW_COMPONENT,
    UNHIGHLIGHT_PREVIEW_COMPONENT
} from '../actions/preview';

import { Preview } from '../models';

const PreviewState = Record({
    selectedItems: Set(),
    highlightedItems: Set()
});

export default (state = new PreviewState(), action) => {
    switch (action.type) {
        case HIGHLIGHT_PREVIEW_COMPONENT:
            return state.merge({
                highlightedItems: state.get('highlightedItems').add(action.component)
            });

        case UNHIGHLIGHT_PREVIEW_COMPONENT:
            return state.merge({
                highlightedItems: state.get('highlightedItems').delete(action.component)
            });

        case SELECT_PREVIEW_COMPONENT:
            return state.merge({
                selectedItems: state.get('selectedItems').add(action.component)
            });

        case DESELECT_PREVIEW_COMPONENT:
            return state.merge({
                selectedItems: state.get('selectedItems').delete(action.component)
            });

        default: return state;
    }
};
