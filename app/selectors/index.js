/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createSelector } from 'reselect';
import { getComponentWithQueryArgs } from '../reducers/project';
import { getComponentMeta } from '../utils/meta';

export const haveNestedConstructorsSelector = state =>
  !state.project.nestedConstructors.isEmpty();

export const topNestedConstructorSelector = state =>
  haveNestedConstructorsSelector(state)
    ? state.project.nestedConstructors.first()
    : null;

export const currentRouteSelector = state =>
  state.project.currentRouteId > -1
    ? state.project.data.routes.get(state.project.currentRouteId)
    : null;

export const currentComponentsSelector = createSelector(
  topNestedConstructorSelector,
  currentRouteSelector,

  (topNestedConstructor, currentRoute) => {
    if (topNestedConstructor) return topNestedConstructor.components;
    if (currentRoute) return currentRoute.components;
    return null;
  },
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
  },
);

export const currentRootComponentIdSelector = createSelector(
  topNestedConstructorSelector,
  currentRouteSelector,
  state => state.project.currentRouteIsIndexRoute,

  (topNestedConstructor, currentRoute, currentRouteIsIndexRoute) => {
    if (topNestedConstructor) return topNestedConstructor.rootId;
    
    if (currentRoute) {
      return currentRouteIsIndexRoute
        ? currentRoute.indexComponent
        : currentRoute.component;
    }
    
    return -1;
  },
);

export const currentSelectedComponentIdsSelector = createSelector(
  topNestedConstructorSelector,
  state => state.project.selectedItems,

  (topNestedConstructor, selectedItems) => topNestedConstructor
    ? topNestedConstructor.selectedComponentIds
    : selectedItems,
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
    : highlightedItems,
);

export const currentComponentsStackSelector = createSelector(
  state => state.project,
  
  project => project.nestedConstructors.map((nestedConstructor, idx, list) => {
    const componentsMap = (idx > 0)
      ? list.get(idx - 1).components
      : project.data.routes.get(project.currentRouteId).components;
  
    return componentsMap.get(nestedConstructor.componentId);
  }),
);
