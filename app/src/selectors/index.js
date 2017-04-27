/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { createSelector } from 'reselect';
import IntlMessageFormat from 'intl-messageformat';
import _forOwn from 'lodash.forown';

import {
  getComponentMeta,
  findPropThatPushedDataContext,
  isValidSourceForValue,
} from '../utils/meta';

import { getTypeNameByPath } from '../utils/schema';
import { INVALID_ID } from '../constants/misc';

export const haveNestedConstructorsSelector = state =>
  !state.project.nestedConstructors.isEmpty();

export const topNestedConstructorSelector = state =>
  haveNestedConstructorsSelector(state)
    ? state.project.nestedConstructors.first()
    : null;

export const currentRouteSelector = state =>
  state.project.currentRouteId !== INVALID_ID
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

// Path in a nested constructor is always relative to components map
// so it must start with component id
const getComponentIdFromNestedConstructor = nestedConstructor =>
  nestedConstructor.path.steps[0];

export const topNestedConstructorComponentSelector = createSelector(
  state => state.project.nestedConstructors,
  currentRouteSelector,

  (nestedConstructors, currentRoute) => {
    if (nestedConstructors.isEmpty()) return null;

    const topNestedConstructor = nestedConstructors.first();
    const componentId =
      getComponentIdFromNestedConstructor(topNestedConstructor);
    
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
    } else {
      return INVALID_ID;
    }
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
      const componentId =
        getComponentIdFromNestedConstructor(nestedConstructor);
      
      const componentsMap = (idx < list.size - 1)
        ? list.get(idx + 1).components
        : currentRoute.components;
      
      return componentsMap.get(componentId);
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
    const ownerComponentDesignerPropMeta =
      topNestedConstructor.valueInfo.valueDef;
  
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
      
        if (!dataContextOriginValue.isLinkedWithData()) return;
      
        const dataContext = dataContextOriginValue.getDataContext()
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

export const ownerPropsSelector = createSelector(
  topNestedConstructorSelector,
  
  topNestedConstructor => {
    if (!topNestedConstructor) return null;
    
    const ownerComponentPropMeta = topNestedConstructor.valueInfo.valueDef;
    
    return isValidSourceForValue(ownerComponentPropMeta, 'designer')
      ? ownerComponentPropMeta.sourceConfigs.designer.props || null
      : null;
  },
);

export const ownerUserTypedefsSelector = createSelector(
  topNestedConstructorSelector,
  
  topNestedConstructor => {
    if (!topNestedConstructor) return null;
    return topNestedConstructor.valueInfo.userTypedefs;
  },
);

/**
 *
 * @param {Object} localization
 * @param {string} language
 * @param {string} id
 * @param {Object} values
 * @return {string}
 */
const getLocalizedText = (localization, language, id, values) =>
  new IntlMessageFormat(localization[id], language).format(values);

/**
 *
 * @param {Object} state
 * @return {function(id: string, [values]: Object): string}
 */
export const getLocalizedTextFromState = createSelector(
  state => state.app.localization,
  state => state.app.language,

  (localization, language) =>
    (id, values = {}) => getLocalizedText(localization, language, id, values),
);

/**
 *
 * @param {Object} state
 * @return {string}
 */
export const containerStyleSelector = createSelector(
  state => state.project.meta,
  
  meta => {
    const combinedStyle = Object.keys(meta).reduce(
      (acc, cur) => Object.assign(acc, meta[cur].containerStyle || {}),
      {},
    );
    
    return Object.keys(combinedStyle)
      .map(prop => `${prop}:${combinedStyle[prop]}`)
      .join(';');
  },
);

/**
 *
 * @param {Object}
 * @return {Object}
 */
export const rootDraggedComponentSelector = createSelector(
  state => state.project.draggingComponent,
  state => state.project.draggedComponents,
  state => state.project.draggedComponentId,
  
  (draggingComponent, draggedComponents, draggedComponentId) => {
    if (!draggingComponent) return null;
    if (draggedComponentId === INVALID_ID) return draggedComponents.get(0);
    return draggedComponents.get(draggedComponentId);
  },
);
