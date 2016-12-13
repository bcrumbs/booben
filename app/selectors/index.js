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

export const topNestedConstructorComponentSelector = createSelector(
    state => state.project.nestedConstructors,
    currentRouteSelector,

    (nestedConstructors, currentRoute) => {
        if (nestedConstructors.isEmpty()) return null;

        const topNestedConstructor = nestedConstructors.first(),
            componentId = topNestedConstructor.componentId;

        const components = nestedConstructors.size === 1
            ? currentRoute.components
            : nestedConstructors.get(1).components;

        return components.get(componentId) || null;
    }
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

export const singleComponentSelectedSelector = state =>
    currentSelectedComponentIdsSelector(state).size === 1;

export const firstSelectedComponentIdSelector = state =>
    currentSelectedComponentIdsSelector(state).first();

export const currentHighlightedComponentIdsSelector = createSelector(
    topNestedConstructorSelector,
    state => state.project.highlightedItems,

    (topNestedConstructor, highlightedItems) => topNestedConstructor
        ? topNestedConstructor.highlightedComponentIds
        : highlightedItems
);

const getAllQueryPaths = prop =>
	prop.source === 'data'
	&&	prop.sourceData.queryPath;

export const getComponentGraphQLQueryArgs = createSelector(
	currentRouteSelector,
	state => state.project.linkingPropOfComponentId,
	(currentRoute, componentId) =>
		currentRoute.components
			.get(componentId).props
				.map(getAllQueryPaths)
				.filter(v => v)
);
