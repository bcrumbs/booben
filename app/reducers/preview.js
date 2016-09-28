'use strict';

import { Record, Set } from 'immutable';

import {
    DESELECT_PREVIEW_COMPONENT,
    SELECT_PREVIEW_COMPONENT,
    HIGHLIGHT_PREVIEW_COMPONENT,
    UNHIGHLIGHT_PREVIEW_COMPONENT,
    SHOW_DND_PREVIEW_COMPONENT,
    HIDE_DND_PREVIEW_COMPONENT
} from '../actions/preview';

const PreviewState = Record({
    selectedItems: Set(),
    highlightedItems: Set(),
    dndComponent: null
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

        case SHOW_DND_PREVIEW_COMPONENT:
            return state.merge({
                dndComponent: action.component
            });

        case HIDE_DND_PREVIEW_COMPONENT:
            return state.merge({
                dndComponent: null
            });

        default: return state;
    }
};
