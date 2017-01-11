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

export const getCurrentComponentWithQueryArgs = createSelector(
  state => state.project,
  state => state.project.linkingPropOfComponentId,
  haveNestedConstructorsSelector,
  topNestedConstructorComponentSelector,

  (
    project,
    componentId,
    haveNestedConstructors,
    nestedConstructorsTopComponent,
  ) => haveNestedConstructors
    ? nestedConstructorsTopComponent
    : getComponentWithQueryArgs(project, componentId, true),
);

export const getRootComponentWithQueryArgs = createSelector(
  state => state.project,
  state => state.linkingPropOfComponentId,
  haveNestedConstructorsSelector,

  (project, componentId, haveNestedConstructorsSelector) =>
     haveNestedConstructorsSelector
       ? getComponentWithQueryArgs(project, componentId, false)
       : null,
);

/**
 * @param {Object} parentComponent
 * @param {Object} childComponent
 * @return {bool}
 */
const containComponent = (parentComponent, childComponent) =>
  parentComponent === childComponent ||
  parentComponent.props.some(prop =>
    prop.source === 'designer' && prop.sourceData.components.some(
      component => containComponent(component, childComponent),
    ),
  );

/**
 * @param {Object[]} types
 * @param {Object} type
 * @param {Array<string>} path
 * @return {Object|undefined}
 */
const getLastType = (types, type, path) => {
  const pathStep = path[0];
  let typeName;
  if (pathStep.includes('/')) {
    const [fieldName, connectionFieldName] = pathStep.split('/');
    
    typeName = type
      .fields[fieldName]
      .connectionFields[connectionFieldName].type;
  } else {
    typeName = type.fields[pathStep].type;
  }

  return path.length === 1
    ? types[typeName]
    : getLastType(types, types[typeName], path.slice(1));
};

/**
 * @param {Object} prop
 * @param {Object} schema
 * @param {Object[]} [contexts=[]]
 * @param {string[]} [context=null]
 */
const getContextQueryPath = (prop, schema, contexts = [], context = null) => {
  const { queryTypeName, types } = schema;
  
  if (
    prop.source === 'data' &&
    prop.sourceData &&
    prop.sourceData.queryPath
  ) {
    let isDataContext = false;
    
    if (typeof context === 'undefined') {
      isDataContext = true;
      context = prop.sourceData.toJS().dataContext;
    }

    if (!context || !context.length) return null;

    if (isDataContext) context = [...context, ...context.slice(-1)];

    let queryPath = prop.sourceData.queryPath.map(({ field }) => field).toJS();

    const queryPathPrefix = contexts.find(
      searchContext => searchContext && context.slice(0, -1).every(
        (contextName, key) => searchContext.context[key] === contextName,
      ),
    );

    if (queryPathPrefix)
      queryPath = queryPathPrefix.contextQueryPath.concat(queryPath);

    let type = getLastType(
      types,
      types[queryTypeName],
      queryPath,
    );

    if (!type) {
      queryPath = queryPath.slice(0, -1);
      type = getLastType(
        types,
        types[queryTypeName],
        queryPath,
      );
    }

    return {
      context,
      contextQueryPath: queryPath,
      contextFieldType: {
        name: type.name,
        type: type.name,
      },
    };
  } else {
    return null;
  }
};

/**
 * @param {Object} component
 * @param {Object} schema
 * @param {Array<Object>} contexts
 * @param {Object} topComponent
 * @return {Array<Object>}
 */
const getAllNestedContexts = (component, schema, contexts, topComponent) =>
  component.props.reduce(
    (acc, prop) => {
      if (prop.source === 'designer') {
        return acc.concat(
          prop.sourceData.components.reduce(
            (contextAcc, component) => contextAcc.concat(
              getAllNestedContexts(
                component,
                schema,
                [...contexts, ...contextAcc],
                topComponent,
              ),
            )
          , []),
        );
      } else {
        return acc.concat(
          containComponent(component, topComponent)
            ? [getContextQueryPath(prop, schema, [...contexts, ...acc])]
            : [],
        );
      }
    }
  , []).filter(v => v);

/**
 * @param {Object} component
 * @param {Object} schema
 * @param {Object} meta
 * @return {Array<Object>}
 */
const getAllRootContexts = (component, schema, meta) => {
  const propsMeta = getComponentMeta(component.name, meta).props;
  return Object.keys(propsMeta).map(
    propName => {
      const propMeta = propsMeta[propName];
      if (propMeta.source.includes('data')) {
        const context = propMeta.sourceConfigs.data.pushDataContext;

        return getContextQueryPath(
          component.props.get(propName),
          schema,
          [],
          [context],
        );
      }
      
      return void 0;
    },
  ).filter(v => v);
};

export const getAllPossibleNestedContexts = createSelector(
  state => state.project,
  state => state.project.linkingPropOfComponentId,
  state => state.project.schema,
  state => state.project.meta,
  getRootComponentWithQueryArgs,
  haveNestedConstructorsSelector,
  topNestedConstructorComponentSelector,
  
  (
    project,
    componentId,
    schema,
    meta,
    rootComponentWithQueryArgs,
    haveNestedConstructorsSelector,
    topNestedConstructorComponent,
  ) => {
    if (haveNestedConstructorsSelector && schema) {
      const rootContexts = getAllRootContexts(
        rootComponentWithQueryArgs,
        schema,
        meta,
      );
      
      return project.nestedConstructors.size === 1
        ? rootContexts
        : project.nestedConstructors.slice(1).reverse().reduce(
        (acc, { components }) => acc.concat(
          components.reduce(
            (acc, component) =>
              acc.concat(getAllNestedContexts(
                component,
                schema,
                [...acc, ...rootContexts],
                topNestedConstructorComponent,
              ),
            )
          , []).filter(v => v),
        )
      , []);
    }
  
    return [];
  },
);
