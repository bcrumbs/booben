/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createSelector } from 'reselect';

export const haveNestedConstructorsSelector = state =>
    !state.project.nestedConstructors.isEmpty();

export const topNestedConstructorSelector = state => haveNestedConstructorsSelector(state)
    ? state.project.nestedConstructors.first()
    : null;

export const currentRouteSelector = state => state.project.currentRouteId > -1
    ? state.project.data.routes.get(state.project.currentRouteId)
    : null;

export const currentComponentsSelector = createSelector(
    topNestedConstructorSelector,
    currentRouteSelector,

    (topNestedConstructor, currentRoute) => topNestedConstructor
        ? topNestedConstructor.components
        : currentRoute ? currentRoute.components : null
);

export const currentRootComponentIdSelector = createSelector(
    topNestedConstructorSelector,
    currentRouteSelector,
    state => state.project.currentRouteIsIndexRoute,

    (topNestedConstructor, currentRoute, currentRouteIsIndexRoute) => topNestedConstructor
        ? topNestedConstructor.rootId
        : currentRoute
            ? currentRouteIsIndexRoute
                ? currentRoute.indexComponent
                : currentRoute.component
            : -1
);

export const currentSelectedComponentIdsSelector = createSelector(
    topNestedConstructorSelector,
    state => state.project.selectedItems,

    (topNestedConstructor, selectedItems) => topNestedConstructor
        ? topNestedConstructor.selectedComponentIds
        : selectedItems
);

export const currentHighlightedComponentIdsSelector = createSelector(
    topNestedConstructorSelector,
    state => state.project.highlightedItems,

    (topNestedConstructor, highlightedItems) => topNestedConstructor
        ? topNestedConstructor.highlightedComponentIds
        : highlightedItems
);
