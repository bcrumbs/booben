/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createSelector } from 'reselect';
import _forOwn from 'lodash.forown';
import { getNestedTypedef } from '@jssy/types';
import { getComponentMeta, findPropThatPushedDataContext } from '../utils/meta';
import { getTypeNameByPath } from '../utils/schema';

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
  state => state.project.nestedConstructors,
  currentRouteSelector,
  
  (nestedConstructors, currentRoute) =>
    nestedConstructors.map((nestedConstructor, idx, list) => {
      const componentsMap = (idx < list.size - 1)
        ? list.get(idx + 1).components
        : currentRoute.components;
      
      return componentsMap.get(nestedConstructor.componentId);
    }),
);

export const availableDataContextsSelector = createSelector(
  state => state.project.meta,
  state => state.project.schema,
  topNestedConstructorSelector,
  topNestedConstructorComponentSelector,
  currentComponentsStackSelector,
  
  (
    meta,
    schema,
    topNestedConstructor,
    topNestedConstructorComponent,
    currentComponentsStack,
  ) => {
    if (!topNestedConstructor) return [];
  
    const ownerComponent = topNestedConstructorComponent;
    const ownerComponentMeta = getComponentMeta(ownerComponent.name, meta);
    const ownerComponentDesignerPropMeta = getNestedTypedef(
      ownerComponentMeta.props[topNestedConstructor.prop],
      topNestedConstructor.path,
      ownerComponentMeta.types,
    );
  
    const dataContexts = [];
  
    _forOwn(
      ownerComponentDesignerPropMeta.sourceConfigs.designer.props,
      ownerPropMeta => {
        if (!ownerPropMeta.dataContext) return;
      
        const dataContextOriginData = findPropThatPushedDataContext(
          ownerComponentMeta,
          ownerPropMeta.dataContext,
        );
      
        if (!dataContextOriginData) return;
      
        const dataContextOriginValue =
          ownerComponent.props.get(dataContextOriginData.propName);
      
        if (
          dataContextOriginValue.source !== 'data' ||
          !dataContextOriginValue.sourceData.queryPath
        ) return;
      
        const dataContext = dataContextOriginValue.sourceData.dataContext
          .toJS()
          .concat(ownerPropMeta.dataContext);
      
        dataContexts.push(dataContext);
      },
    );
  
    const depth = currentComponentsStack.size;
  
    return dataContexts.map(dataContext => {
      const typeName = dataContext.reduce((acc, cur, idx) => {
        const component = currentComponentsStack.get(depth - idx - 1);
        const componentMeta = getComponentMeta(component.name, meta);
        const { propName: dataPropName } =
          findPropThatPushedDataContext(componentMeta, cur);
      
        // Data props with data context cannot be nested
        const dataPropValue = component.props.get(dataPropName);
        const path = dataPropValue.sourceData.queryPath
          .map(step => step.field)
          .toJS();
      
        return getTypeNameByPath(schema, path, acc);
      }, schema.queryTypeName);
    
      return { dataContext, typeName };
    });
  },
);
