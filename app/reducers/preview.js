'use strict';

import { Record, Set } from 'immutable';

import {
    PREVIEW_SELECT_COMPONENT,
    PREVIEW_DESELECT_COMPONENT,
    PREVIEW_TOGGLE_COMPONENT_SELECTION,
    PREVIEW_HIGHLIGHT_COMPONENT,
    PREVIEW_UNHIGHLIGHT_COMPONENT,
    PREVIEW_TOGGLE_HIGHLIGHTING,
    PREVIEW_SET_BOUNDARY_COMPONENT,
    PREVIEW_SET_IS_INDEX_ROUTE,
    PREVIEW_START_DRAG_COMPONENT,
    PREVIEW_STOP_DRAG_COMPONENT,
    PREVIEW_DRAG_OVER_COMPONENT,
    PREVIEW_DRAG_OVER_PLACEHOLDER
} from '../actions/preview';

const PreviewState = Record({
    selectedItems: Set(),
    highlightedItems: Set(),
    highlightingEnabled: true,
    boundaryComponentId: null,
    currentRouteIsIndexRoute: false,
    draggingComponent: false,
    draggedComponent: null,
    draggedComponentName: '',
    draggingOverComponentId: null,
    draggingOverPlaceholder: false,
    placeholderContainerId: null,
    placeholderAfter: -1
});

export default (state = new PreviewState(), action) => {
    switch (action.type) {
        case PREVIEW_HIGHLIGHT_COMPONENT:
            return state.update('highlightedItems', set => set.add(action.componentId));

        case PREVIEW_UNHIGHLIGHT_COMPONENT:
            return state.update('highlightedItems', set => set.delete(action.componentId));

        case PREVIEW_TOGGLE_HIGHLIGHTING: {
            if (state.highlightingEnabled === action.enable) {
                return state;
            }
            else {
                return state.merge({
                    highlightingEnabled: action.enable,
                    highlightedItems: Set()
                });
            }
        }

        case PREVIEW_SELECT_COMPONENT:
            if (action.exclusive) {
                return state.set('selectedItems', Set([action.componentId]));
            }
            else {
                return state.update('selectedItems', set => set.add(action.componentId));
            }

        case PREVIEW_DESELECT_COMPONENT:
            return state.update('selectedItems', set => set.delete(action.componentId));

        case PREVIEW_TOGGLE_COMPONENT_SELECTION: {
            const updater = state.selectedItems.has(action.componentId)
                ? set => set.delete(action.componentId)
                : set => set.add(action.componentId);

            return state.update('selectedItems', updater);
        }

        case PREVIEW_SET_BOUNDARY_COMPONENT:
            return state.set('boundaryComponentId', action.componentId);

        case PREVIEW_SET_IS_INDEX_ROUTE:
            return state.set('currentRouteIsIndexRoute', action.value);

        case PREVIEW_START_DRAG_COMPONENT:
            return state.merge({
                draggingComponent: true,
                draggedComponentName: action.componentName,
                draggedComponent: action.component
            });

        case PREVIEW_STOP_DRAG_COMPONENT:
            return state.merge({
                draggingComponent: false,
                draggedComponentName: '',
                draggedComponent: null,
                draggingOverComponentId: null
            });

        case PREVIEW_DRAG_OVER_COMPONENT:
            return state.merge({
                draggingOverComponentId: action.componentId,
                draggingOverPlaceholder: false,
                placeholderContainerId: null,
                placeholderAfter: -1
            });

        case PREVIEW_DRAG_OVER_PLACEHOLDER:
            return state.merge({
                draggingOverPlaceholder: true,
                placeholderContainerId: action.containerId,
                placeholderAfter: action.afterIdx
            });

        default: return state;
    }
};
