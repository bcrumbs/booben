'use strict';

import { Record, Set, Map } from 'immutable';

import {
    DESELECT_PREVIEW_COMPONENT,
    SELECT_PREVIEW_COMPONENT,
    HIGHLIGHT_PREVIEW_COMPONENT,
    UNHIGHLIGHT_PREVIEW_COMPONENT,
    SET_PREVIEW_WORKSPACE,
    UNSET_PREVIEW_WORKSPACE,
    SHOW_PREVIEW_WORKSPACE,
    HIDE_PREVIEW_WORKSPACE,
    SET_DOM_ELEMENT_TO_MAP,
    SET_IS_INDEX_ROUTE
} from '../actions/preview';

const PreviewState = Record({
    selectedItems: Set(),
    highlightedItems: Set(),
    workspace: Set(),
    workspaceVisible: false,
    domElementsMap: Map(),
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

        case SET_PREVIEW_WORKSPACE:
            return state.merge({
                workspace: state.get('workspace').add(action.component)
            });

        case UNSET_PREVIEW_WORKSPACE:
            return state.merge({
                workspace: state.get('workspace').delete(action.component)
            });

        case SHOW_PREVIEW_WORKSPACE:
            return state.set('workspaceVisible', true);

        case HIDE_PREVIEW_WORKSPACE:
            return state.set('workspaceVisible', false);

        case SET_DOM_ELEMENT_TO_MAP:
            return state.setIn(['domElementsMap', action.uid], action.component);

        case SET_IS_INDEX_ROUTE:
            return state.set('currentRouteIsIndexRoute', action.value);

        default: return state;
    }
};
