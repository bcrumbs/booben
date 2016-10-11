'use strict';

import { Record, Set } from 'immutable';

import {
    DESELECT_PREVIEW_COMPONENT,
    SELECT_PREVIEW_COMPONENT,
    HIGHLIGHT_PREVIEW_COMPONENT,
    UNHIGHLIGHT_PREVIEW_COMPONENT,
    SET_ROOT_COMPONENT,
    UNSET_ROOT_COMPONENT,
    SHOW_ROOT_COMPONENT,
    HIDE_ROOT_COMPONENT,
    SET_IS_INDEX_ROUTE
} from '../actions/preview';

const PreviewState = Record({
    selectedItems: Set(),
    highlightedItems: Set(),
    rootComponent: Set(),
    rootComponentVisible: false,
    currentRouteIsIndexRoute: false
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

        case SET_ROOT_COMPONENT:
            return state.merge({
                rootComponent: state.get('rootComponent').add(action.component)
            });

        case UNSET_ROOT_COMPONENT:
            return state.merge({
                rootComponent: state.get('rootComponent').delete(action.component)
            });

        case SHOW_ROOT_COMPONENT:
            return state.set('rootComponentVisible', true);

        case HIDE_ROOT_COMPONENT:
            return state.set('rootComponentVisible', false);

        case SET_IS_INDEX_ROUTE:
            return state.set('currentRouteIsIndexRoute', action.value);

        default: return state;
    }
};
