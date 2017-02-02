/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Record, Map, Set, List, is } from 'immutable';
import { getNestedTypedef } from '@jssy/types';

import {
  NOT_LOADED,
  LOADING,
  LOADED,
  LOAD_ERROR,
} from '../constants/loadStates';

import {
  PROJECT_REQUEST,
  PROJECT_LOADED,
  PROJECT_LOAD_FAILED,
  PROJECT_ROUTE_CREATE,
  PROJECT_ROUTE_DELETE,
  PROJECT_ROUTE_UPDATE_FIELD,
  PROJECT_COMPONENT_DELETE,
  PROJECT_COMPONENT_UPDATE_PROP_VALUE,
  PROJECT_COMPONENT_ADD_PROP_VALUE,
  PROJECT_COMPONENT_DELETE_PROP_VALUE,
  PROJECT_COMPONENT_RENAME,
  PROJECT_COMPONENT_TOGGLE_REGION,
  PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT,
  PROJECT_CONSTRUCT_COMPONENT_FOR_PROP,
  PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP,
  PROJECT_SAVE_COMPONENT_FOR_PROP,
  PROJECT_LINK_PROP,
  PROJECT_LINK_WITH_OWNER_PROP,
  PROJECT_LINK_WITH_DATA,
  PROJECT_LINK_PROP_CANCEL,
} from '../actions/project';

import {
  PREVIEW_SELECT_COMPONENT,
  PREVIEW_DESELECT_COMPONENT,
  PREVIEW_TOGGLE_COMPONENT_SELECTION,
  PREVIEW_HIGHLIGHT_COMPONENT,
  PREVIEW_UNHIGHLIGHT_COMPONENT,
  PREVIEW_SET_CURRENT_ROUTE,
  PREVIEW_START_DRAG_NEW_COMPONENT,
  PREVIEW_START_DRAG_EXISTING_COMPONENT,
  PREVIEW_DROP_COMPONENT,
  PREVIEW_DRAG_OVER_COMPONENT,
  PREVIEW_DRAG_OVER_PLACEHOLDER,
} from '../actions/preview';

import {
  APP_LOCALIZATION_LOAD_SUCCESS,
} from '../actions/app';

import {
  STRUCTURE_SELECT_ROUTE,
} from '../actions/structure';

import {
  LIBRARY_SHOW_ALL_COMPONENTS,
} from '../actions/components-library';

import ProjectRoute from '../models/ProjectRoute';
import JssyValue from '../models/JssyValue';
import SourceDataStatic from '../models/SourceDataStatic';
import SourceDataDesigner from '../models/SourceDataDesigner';
import SourceDataData, { QueryPathStep } from '../models/SourceDataData';

import {
  projectToImmutable,
  getMaxRouteId,
  getMaxComponentId,
  gatherRoutesTreeIds,
} from '../models/Project';

import {
  sourceDataToImmutable,
  gatherComponentsTreeIds,
  isRootComponent,
  getValueByPath,
  walkSimpleProps,
  walkComponentsTree,
} from '../models/ProjectComponent';

import {
  transformMetadata,
  getComponentMeta,
  constructComponent,
  parseComponentName,
  formatComponentName,
  propHasDataContext,
} from '../utils/meta';

import { concatPath } from '../utils';
import { parseGraphQLSchema } from '../utils/schema';
import { NO_VALUE } from '../constants/misc';

export const NestedConstructor = Record({
  componentId: -1,
  prop: '',
  path: [],
  
  components: Map(),
  rootId: -1,
  lastComponentId: -1,
  selectedComponentIds: Set(),
  highlightedComponentIds: Set(),
});

const ProjectState = Record({
  projectName: '',
  loadState: NOT_LOADED,
  data: null,
  schema: null,
  meta: null,
  error: null,
  lastRouteId: -1,
  lastComponentId: -1,

  selectedItems: Set(),
  highlightedItems: Set(),
  highlightingEnabled: true,
  showAllComponentsOnPalette: false,
  currentRouteId: -1,
  currentRouteIsIndexRoute: false,
  draggingComponent: false,
  draggedComponentId: -1,
  draggedComponents: null,
  draggingOverComponentId: -1,
  draggingOverPlaceholder: false,
  placeholderContainerId: -1,
  placeholderAfter: -1,

  selectedRouteId: -1,
  indexRouteSelected: false,

  languageForComponentProps: 'en',
  selectingComponentLayout: false,

  nestedConstructors: List(),
  linkingProp: false,
  linkingPropOfComponentId: -1,
  linkingPropName: '',
  linkingPropPath: [],
});

const haveNestedConstructors = state => !state.nestedConstructors.isEmpty();

const getTopNestedConstructor = state =>
  state.nestedConstructors.first() || null;

const openNestedConstructor = (state, nestedConstructor) => state.update(
  'nestedConstructors',
  nestedConstructors => nestedConstructors.unshift(nestedConstructor),
);

const closeAllNestedConstructors = state =>
  state.set('nestedConstructors', List());

const closeTopNestedConstructor = state => state.update(
  'nestedConstructors',
  nestedConstructors => nestedConstructors.shift(),
);

const getPathToCurrentComponents = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0, 'components']
  : ['data', 'routes', state.currentRouteId, 'components'];

const getPathToCurrentLastComponentId = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0, 'lastComponentId']
  : ['lastComponentId'];

const getPathToCurrentRootComponentId = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0, 'rootId']
  : [
    'data',
    'routes',
    state.currentRouteId,
    state.currentRouteIsIndexRoute ? 'indexComponent' : 'component',
  ];

const getPathToCurrentSelectedComponentIds = state =>
  haveNestedConstructors(state)
    ? ['nestedConstructors', 0, 'selectedComponentIds']
    : ['selectedItems'];

const getPathToCurrentHighlightedComponentIds = state =>
  haveNestedConstructors(state)
    ? ['nestedConstructors', 0, 'highlightedComponentIds']
    : ['highlightedItems'];

const selectComponent = (state, componentId) => state.updateIn(
  getPathToCurrentSelectedComponentIds(state),
  selectedComponentIds => selectedComponentIds.add(componentId),
);

const selectComponentExclusive = (state, componentId) =>
  state.setIn(getPathToCurrentSelectedComponentIds(state), Set([componentId]));

const toggleComponentSelection = (state, componentId) => {
  const pathToCurrentSelectedComponentIds =
      getPathToCurrentSelectedComponentIds(state);
  const currentSelectedComponentIds =
    state.getIn(pathToCurrentSelectedComponentIds);

  const updater = currentSelectedComponentIds.has(componentId)
    ? selectedComponentIds => selectedComponentIds.delete(componentId)
    : selectedComponentIds => selectedComponentIds.add(componentId);

  return state.updateIn(pathToCurrentSelectedComponentIds, updater);
};

const deselectComponent = (state, componentId) => state.updateIn(
  getPathToCurrentSelectedComponentIds(state),
  selectedComponentIds => selectedComponentIds.delete(componentId),
);

const highlightComponent = (state, componentId) => state.updateIn(
  getPathToCurrentHighlightedComponentIds(state),
  highlightedComponentIds => highlightedComponentIds.add(componentId),
);

const unhighlightComponent = (state, componentId) => state.updateIn(
  getPathToCurrentHighlightedComponentIds(state),
  highlightedComponentIds => highlightedComponentIds.delete(componentId),
);

const addComponents = (state, parentComponentId, position, components) => {
  const pathToCurrentLastComponentId = getPathToCurrentLastComponentId(state),
    lastComponentId = state.getIn(pathToCurrentLastComponentId),
    nextComponentId = lastComponentId + 1,
    pathToCurrentComponents = getPathToCurrentComponents(state);

  state = state.updateIn(
    pathToCurrentComponents,

    updatedComponents => updatedComponents.withMutations(updatedComponentsMut =>
      void components.forEach(newComponent =>
        void updatedComponentsMut.set(
          newComponent.id + nextComponentId,

          newComponent
            .merge({
              id: newComponent.id + nextComponentId,
              isNew: false,
              parentId: newComponent.parentId === -1
                ? parentComponentId
                : newComponent.parentId + nextComponentId,

              routeId: state.currentRouteId,
              isIndexRoute: state.currentRouteIsIndexRoute,
            })
            .update(
              'children',
              childIds => childIds.map(id => id + nextComponentId),
            ),
        ),
      ),
    ),
  );

  if (parentComponentId !== -1) {
    const pathToChildrenIdsList = [].concat(pathToCurrentComponents, [
      parentComponentId,
      'children',
    ]);

    state = state.updateIn(
      pathToChildrenIdsList,
      childComponentIds => childComponentIds.insert(position, nextComponentId),
    );
  } else {
    state = state.setIn(
      getPathToCurrentRootComponentId(state),
      nextComponentId,
    );
  }

  return state.updateIn(
    pathToCurrentLastComponentId,
    lastComponentId => lastComponentId + components.size,
  );
};

const deleteComponent = (state, componentId) => {
  const pathToCurrentComponents = getPathToCurrentComponents(state),
    currentComponents = state.getIn(pathToCurrentComponents);

  if (!currentComponents.has(componentId)) {
    throw new Error(
      'An attempt was made to delete a component ' +
      'that is not in current editing area',
    );
  }

  const component = currentComponents.get(componentId),
    idsToDelete = gatherComponentsTreeIds(currentComponents, componentId);

  state = state.updateIn(
    pathToCurrentComponents,

    components => components.withMutations(componentsMut =>
      void idsToDelete.forEach(id => void componentsMut.delete(id))),
  );

  if (isRootComponent(component)) {
    state = state.setIn(getPathToCurrentRootComponentId(state), -1);
  } else {
    const pathToChildrenIdsList = [].concat(pathToCurrentComponents, [
      component.parentId,
      'children',
    ]);

    state = state.updateIn(
      pathToChildrenIdsList,
      children => children.filter(id => id !== componentId),
    );
  }

  return state;
};

const moveComponent = (state, componentId, targetComponentId, position) => {
  const pathToCurrentComponents = getPathToCurrentComponents(state),
    currentComponents = state.getIn(pathToCurrentComponents);

  if (!currentComponents.has(componentId)) {
    throw new Error(
      'An attempt was made to move a component ' +
      'that is not in current editing area',
    );
  }

  if (!currentComponents.has(targetComponentId)) {
    throw new Error(
      'An attempt was made to move a component ' +
      'outside current editing area',
    );
  }

  const component = currentComponents.get(componentId);

  if (component.parentId === -1)
    throw new Error('Cannot move root component');

  if (component.parentId === targetComponentId) {
    const childrenPath = [].concat(pathToCurrentComponents, [
      component.parentId,
      'children',
    ]);

    return state.updateIn(childrenPath, ids => {
      const idx = ids.indexOf(componentId);

      return idx === position
        ? ids
        : ids.delete(idx).insert(position - (idx < position), componentId);
    });
  }

  const sourceChildrenListPath = [].concat(pathToCurrentComponents, [
    component.parentId,
    'children',
  ]);

  state = state.updateIn(
    sourceChildrenListPath,
    ids => ids.filter(id => id !== componentId),
  );

  const targetChildrenListPath = [].concat(pathToCurrentComponents, [
    targetComponentId,
    'children',
  ]);

  state = state.updateIn(
    targetChildrenListPath,
    ids => ids.insert(position, componentId),
  );

  const pathToParentId = [].concat(
    pathToCurrentComponents,
    [componentId, 'parentId'],
  );
  
  return state.setIn(pathToParentId, targetComponentId);
};

const initDNDState = state => state.merge({
  draggingComponent: false,
  draggedComponents: null,
  draggedComponentId: -1,
  draggingOverComponentId: -1,
  draggingOverPlaceholder: false,
  placeholderContainerId: -1,
  placeholderAfter: -1,
  highlightingEnabled: true,
});

const insertDraggedComponents = (state, components) => {
  if (state.placeholderContainerId === -1) {
    // Creating root component
    return addComponents(state, -1, 0, components);
  } else {
    // Creating nested component
    return addComponents(
      state,
      state.placeholderContainerId,
      state.placeholderAfter + 1,
      components,
    );
  }
};

const selectFirstRoute = state => state.merge({
  selectedRouteId: state.data.routes.size > 0
    ? state.data.routes.get(0).id
    : -1,

  indexRouteSelected: false,
});

const isPrefixList = (maybePrefix, list) => {
  if (maybePrefix.size > list.size) return false;
  return maybePrefix.every((item, idx) => is(item, list.get(idx)));
};

const expandPropPath = propPath => propPath
  .slice(0, -1)
  .reduce((acc, cur) => acc.concat([cur, 'sourceData', 'value']), [])
  .concat(propPath[propPath.length - 1]);

// TODO: Refactor away from using real paths
const clearOutdatedDataProps = (
  state,
  updatedComponentId,
  updatedDataPropName,
) => {
  const currentComponentsPath = getPathToCurrentComponents(state),
    currentComponents = state.getIn(currentComponentsPath),
    updatedComponent = currentComponents.get(updatedComponentId);

  const oldValue = updatedComponent.props.get(updatedDataPropName);
  
  if (oldValue.source !== 'data' || !oldValue.sourceData.queryPath)
    return state;

  const componentMeta = getComponentMeta(updatedComponent.name, state.meta),
    updatedPropMeta = componentMeta.props[updatedDataPropName];

  if (!propHasDataContext(updatedPropMeta)) return state;

  const outdatedDataContext = oldValue.sourceData.dataContext
    .push(updatedPropMeta.sourceConfigs.data.pushDataContext);

  const visitDesignerProp = (designerPropValue, path) => {
    walkComponentsTree(
      designerPropValue.sourceData.components,
      designerPropValue.sourceData.rootId,

      component => {
        const componentId = component.id,
          componentMeta = getComponentMeta(component.name, state.meta);

        walkSimpleProps(
          component,
          componentMeta,

          (propValue, _, pathToProp) => {
            if (propValue.source === 'data') {
              const containsOutdatedDataContext = isPrefixList(
                outdatedDataContext,
                propValue.sourceData.dataContext,
              );

              if (containsOutdatedDataContext) {
                const pathToUpdatedValue = [].concat(path, [
                  'sourceData',
                  'components',
                  componentId,
                  'props',
                ], expandPropPath(pathToProp));

                const newSourceData = new SourceDataData({
                  queryPath: null,
                });

                state = state.updateIn(
                  pathToUpdatedValue,

                  updatedValue => updatedValue.set(
                    'sourceData',
                    newSourceData,
                  ),
                );
              }
            } else if (propValue.source === 'designer') {
              if (propValue.sourceData.rootId > -1) {
                const pathToNextDesignerValue = [].concat(path, [
                  'sourceData',
                  'components',
                  componentId,
                  'props',
                ], expandPropPath(pathToProp));

                visitDesignerProp(
                  state.getIn(pathToNextDesignerValue),
                  pathToNextDesignerValue,
                );
              }
            }
          },
        );
      },
    );
  };
  
  const visitProp = (propValue, _, pathToProp) => {
    if (propValue.source === 'designer' && propValue.sourceData.rootId > -1) {
      const pathToValue = [].concat(currentComponentsPath, [
        updatedComponentId,
        'props',
      ], expandPropPath(pathToProp));
    
      visitDesignerProp(propValue, pathToValue);
    }
  };

  walkSimpleProps(updatedComponent, componentMeta, visitProp);
  return state;
};

const initLinkingPropState = state => state
  .merge({
    linkingProp: false,
    linkingPropOfComponentId: -1,
    linkingPropName: '',
  })
  .set('linkingPropPath', []);

const getPathToComponentWithQueryArgs = (state, dataContext) => {
  let currentNestedConstructorIndex =
    state.nestedConstructors.size > 0 ? 0 : -1;
  
  let currentNestedConstructor = currentNestedConstructorIndex !== -1
    ? state.nestedConstructors.get(currentNestedConstructorIndex)
    : null;
  
  let currentComponentId = state.linkingPropOfComponentId;
  let i = 0;
  
  while (i < dataContext.length) {
    if (currentNestedConstructorIndex === -1)
      throw new Error('getPathToComponentWithQueryArgs: invalid dataContext');
    
    currentComponentId = currentNestedConstructor.componentId;
    
    currentNestedConstructorIndex =
      currentNestedConstructorIndex === state.nestedConstructors.size
        ? -1
        : currentNestedConstructorIndex + 1;
  
    currentNestedConstructor = currentNestedConstructorIndex !== -1
      ? state.nestedConstructors.get(currentNestedConstructorIndex)
      : null;
    
    i++;
  }
  
  return currentNestedConstructorIndex !== -1
    ? [
      'data',
      'routes',
      state.currentRouteId,
      'components',
      currentComponentId,
    ]
    : [
      'nestedConstructors',
      currentNestedConstructorIndex,
      'components',
      currentComponentId,
    ];
};

export const makeCurrentQueryArgsGetter = state => dataContext => {
  const pathToQueryArgs = [
    ...getPathToComponentWithQueryArgs(state, dataContext),
    'queryArgs',
    dataContext.join(' '),
  ];
  
  return state.getIn(pathToQueryArgs);
};


const handlers = {
  [PROJECT_REQUEST]: (state, action) => state.merge({
    projectName: action.projectName,
    loadState: LOADING,
  }),
  
  [PROJECT_LOADED]: (state, action) => {
    const project = projectToImmutable(action.project),
      lastRouteId = getMaxRouteId(project),
      lastComponentId = getMaxComponentId(project),
      meta = transformMetadata(action.metadata),
      schema = action.schema ? parseGraphQLSchema(action.schema) : null;
  
    return state
      .merge({
        projectName: action.project.name,
        loadState: LOADED,
        data: project,
        error: null,
        lastRouteId,
        lastComponentId,
        selectedRouteId: project.rootRoutes.size > 0
          ? project.rootRoutes.get(0)
          : -1,
        indexRouteSelected: false,
      })
      .set('meta', meta)
      .set('schema', schema);
  },

  [PROJECT_LOAD_FAILED]: (state, action) => state.merge({
    loadState: LOAD_ERROR,
    error: action.error,
  }),
  
  [PROJECT_ROUTE_CREATE]: (state, action) => {
    const newRouteId = state.lastRouteId + 1;
  
    const parentRoute = action.parentRouteId > -1
      ? state.data.routes.get(action.parentRouteId)
      : null;
  
    const fullPath = parentRoute
      ? concatPath(parentRoute.fullPath, action.path)
      : action.path;
  
    const newRoute = new ProjectRoute({
      id: newRouteId,
      parentId: action.parentRouteId,
      path: action.path,
      fullPath,
      title: action.title,
    });
  
    state = state.setIn(['data', 'routes', newRouteId], newRoute);
  
    const pathToIdsList = action.parentRouteId === -1
      ? ['data', 'rootRoutes']
      : ['data', 'routes', action.parentRouteId, 'children'];
  
    return state
      .updateIn(pathToIdsList, list => list.push(newRouteId))
      .set('lastRouteId', newRouteId);
  },
  
  [PROJECT_ROUTE_DELETE]: (state, action) => {
    const deletedRoute = state.data.routes.get(action.routeId),
      deletedRouteIds = gatherRoutesTreeIds(state.data, action.routeId);
  
    // De-select and de-highlight all components
    state = state.merge({
      selectedItems: Set(),
      highlightedItems: Set(),
    });
  
    // Delete routes
    state = state.updateIn(
      ['data', 'routes'],
      routes => routes.filter(route => !deletedRouteIds.has(route.id)),
    );
  
    // Update rootRoutes or parent's children list
    const pathToIdsList = deletedRoute.parentId === -1
      ? ['data', 'rootRoutes']
      : ['data', 'routes', deletedRoute.parentId, 'children'];
  
    state = state.updateIn(
      pathToIdsList,
      routeIds => routeIds.filter(routeId => routeId !== action.routeId),
    );
  
    // Update selected route
    const deletedRouteIsSelected =
      state.selectedRouteId > -1 &&
      deletedRouteIds.has(state.selectedRouteId);
  
    if (deletedRouteIsSelected) state = selectFirstRoute(state);
    return state;
  },
  
  [PROJECT_ROUTE_UPDATE_FIELD]: (state, action) => state.setIn(
    ['data', 'routes', action.routeId, action.field],
    action.newValue,
  ),
  
  [PROJECT_COMPONENT_DELETE]: (state, action) => {
    state = deselectComponent(state, action.componentId);
    state = unhighlightComponent(state, action.componentId);
  
    if (state.draggedComponentId === action.componentId)
      state = initDNDState(state);
  
    return deleteComponent(state, action.componentId);
  },
  
  [PROJECT_COMPONENT_UPDATE_PROP_VALUE]: (state, action) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      currentComponents = state.getIn(pathToCurrentComponents);
  
    if (!currentComponents.has(action.componentId)) {
      throw new Error(
        'An attempt was made to update a component ' +
        'that is not in current editing area',
      );
    }
  
    const newPropValue = new JssyValue({
      source: action.newSource,
      sourceData: sourceDataToImmutable(
        action.newSource,
        action.newSourceData,
      ),
    });
  
    // Data prop with pushDataContext cannot be nested,
    // so we need to clearOutdatedDataProps only when updating top-level prop
    if (!action.path || !action.path.length) {
      state = clearOutdatedDataProps(
        state,
        action.componentId,
        action.propName,
      );
    }
  
    const pathToProp = [].concat(
      pathToCurrentComponents,
      action.componentId,
      'props',
      action.propName,
    );
    
    return state.updateIn(
      pathToProp,
      propValue => action.path.length === 0
        ? newPropValue
        : propValue.setInStatic(action.path, newPropValue),
    );
  },
  
  [PROJECT_COMPONENT_ADD_PROP_VALUE]: (state, action) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      currentComponents = state.getIn(pathToCurrentComponents);
  
    if (!currentComponents.has(action.componentId)) {
      throw new Error(
        'An attempt was made to update a component ' +
        'that is not in current editing area',
      );
    }
  
    const newValue = new JssyValue({
      source: action.source,
      sourceData: sourceDataToImmutable(
        action.source,
        action.sourceData,
      ),
    });
    
    const pathToProp = [].concat(
      pathToCurrentComponents,
      action.componentId,
      'props',
      action.propName,
    );
    
    return state.updateIn(
      pathToProp,
      propValue => propValue.addValueInStatic(
        action.path,
        action.index,
        newValue,
      ),
    );
  },
  
  [PROJECT_COMPONENT_DELETE_PROP_VALUE]: (state, action) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      currentComponents = state.getIn(pathToCurrentComponents);
  
    if (!currentComponents.has(action.componentId)) {
      throw new Error(
        'An attempt was made to update a component ' +
        'that is not in current editing area',
      );
    }
    
    const pathToProp = [].concat(
      pathToCurrentComponents,
      action.componentId,
      'props',
      action.propName,
    );
    
    return state.updateIn(
      pathToProp,
      propValue => propValue.deleteValueInStatic(action.path, action.index),
    );
  },
  
  [PROJECT_COMPONENT_RENAME]: (state, action) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      currentComponents = state.getIn(pathToCurrentComponents);
  
    if (!currentComponents.has(action.componentId)) {
      throw new Error(
        'An attempt was made to update a component ' +
        'that is not in current editing area',
      );
    }
  
    const path = [].concat(pathToCurrentComponents, [
      action.componentId,
      'title',
    ]);
  
    return state.setIn(path, action.newTitle);
  },
  
  [PROJECT_COMPONENT_TOGGLE_REGION]: (state, action) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      currentComponents = state.getIn(pathToCurrentComponents);
  
    if (!currentComponents.has(action.componentId)) {
      throw new Error(
        'An attempt was made to update a component ' +
        'that is not in current editing area',
      );
    }
  
    const path = [].concat(pathToCurrentComponents, [
      action.componentId,
      'regionsEnabled',
    ]);
  
    return state.updateIn(path, regionsEnabled => action.enable
      ? regionsEnabled.add(action.regionIdx)
      : regionsEnabled.delete(action.regionIdx),
    );
  },
  
  [PREVIEW_HIGHLIGHT_COMPONENT]: (state, action) =>
    highlightComponent(state, action.componentId),
  
  [PREVIEW_UNHIGHLIGHT_COMPONENT]: (state, action) =>
    unhighlightComponent(state, action.componentId),
  
  [PREVIEW_SELECT_COMPONENT]: (state, action) => {
    state = state.set('showAllComponentsOnPalette', false);
  
    return action.exclusive
      ? selectComponentExclusive(state, action.componentId)
      : selectComponent(state, action.componentId);
  },
  
  [PREVIEW_DESELECT_COMPONENT]: (state, action) => {
    state = state.set('showAllComponentsOnPalette', false);
    return deselectComponent(state, action.componentId);
  },
  
  [PREVIEW_TOGGLE_COMPONENT_SELECTION]: (state, action) => {
    state = state.set('showAllComponentsOnPalette', false);
    return toggleComponentSelection(state, action.componentId);
  },
  
  [PREVIEW_SET_CURRENT_ROUTE]: (state, action) => {
    state = closeAllNestedConstructors(state);
  
    return state.merge({
      currentRouteId: action.routeId,
      currentRouteIsIndexRoute: action.isIndexRoute,
      selectedItems: Set(),
      highlightedItems: Set(),
    });
  },
  
  [PREVIEW_START_DRAG_NEW_COMPONENT]: (state, action) => {
    if (state.selectingComponentLayout) return state;
  
    return state.merge({
      draggingComponent: true,
      draggedComponentId: -1,
      draggedComponents: action.components,
      highlightingEnabled: false,
      highlightedItems: Set(),
    });
  },
  
  [PREVIEW_START_DRAG_EXISTING_COMPONENT]: (state, action) => {
    if (state.selectingComponentLayout) return state;
  
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      currentComponents = state.getIn(pathToCurrentComponents);
  
    if (!currentComponents.has(action.componentId)) {
      throw new Error(
        'An attempt was made to drag a component ' +
        'that is not in current editing area',
      );
    }
  
    return state.merge({
      draggingComponent: true,
      draggedComponentId: action.componentId,
      draggedComponents: currentComponents,
      highlightingEnabled: false,
      highlightedItems: Set(),
    });
  },
  
  [PREVIEW_DROP_COMPONENT]: state => {
    if (!state.draggingComponent) return state;
    if (!state.draggingOverPlaceholder) return initDNDState(state);
  
    if (state.draggedComponentId > -1) {
      // We're dragging an existing component
      state = moveComponent(
        state,
        state.draggedComponentId,
        state.placeholderContainerId,
        state.placeholderAfter + 1,
      );
    
      return initDNDState(state);
    } else {
      // We're dragging a new component from palette
      const rootComponent = state.draggedComponents.get(0),
        componentMeta = getComponentMeta(rootComponent.name, state.meta);
    
      const isCompositeComponentWithMultipleLayouts =
        componentMeta.kind === 'composite' &&
        componentMeta.layouts.length > 1;
    
      if (isCompositeComponentWithMultipleLayouts) {
        // The component is composite and has multiple layouts;
        // we need to ask user which one to use
        return state.merge({
          selectingComponentLayout: true,
          draggingComponent: false,
        });
      } else {
        // No layout options, inserting what we already have
        state = insertDraggedComponents(state, state.draggedComponents);
        return initDNDState(state);
      }
    }
  },
  
  [PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT]: (state, action) => {
    if (!state.selectingComponentLayout) return state;
  
    const components = action.layoutIdx === 0
      ? state.draggedComponents
    
      : constructComponent(
        state.draggedComponents.get(0).name,
        action.layoutIdx,
        state.languageForComponentProps,
        state.meta,
      );
  
    state = insertDraggedComponents(state, components);
    state = state.set('selectingComponentLayout', false);
    return initDNDState(state);
  },
  
  [PROJECT_CONSTRUCT_COMPONENT_FOR_PROP]: (state, action) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      components = state.getIn(pathToCurrentComponents),
      component = components.get(action.componentId),
      currentValue = getValueByPath(component, action.propName, action.path),
      componentMeta = getComponentMeta(component.name, state.meta);
  
    const propMeta = getNestedTypedef(
      componentMeta.props[action.propName],
      action.path,
      componentMeta.types,
    );
  
    if (propMeta.source.indexOf('designer') === -1) {
      throw new Error(
        'An attempt was made to construct a component ' +
        'for prop that does not have \'designer\' source option',
      );
    }
  
    const nestedConstructorData = {
      componentId: action.componentId,
      prop: action.propName,
      path: action.path,
    };
  
    if (currentValue && currentValue.source === 'designer') {
      Object.assign(nestedConstructorData, {
        components: currentValue.sourceData.components,
        rootId: currentValue.sourceData.rootId,
        lastComponentId: currentValue.sourceData.components.size > 0
          ? currentValue.sourceData.components.keySeq().max()
          : -1,
      });
    } else if (propMeta.sourceConfigs.designer.wrapper) {
      const { namespace } = parseComponentName(component.name);
    
      const wrapperFullName = formatComponentName(
        namespace,
        propMeta.sourceConfigs.designer.wrapper,
      );
    
      const wrapperComponents = constructComponent(
        wrapperFullName,
        propMeta.sourceConfigs.designer.wrapperLayout || 0,
        state.languageForComponentProps,
        state.meta,
        { isNew: false, isWrapper: true },
      );
    
      Object.assign(nestedConstructorData, {
        components: wrapperComponents,
        rootId: 0,
        lastComponentId: wrapperComponents.size - 1,
      });
    }
  
    const nestedConstructor = new NestedConstructor(nestedConstructorData);
    return openNestedConstructor(state, nestedConstructor);
  },
  
  [PROJECT_CANCEL_CONSTRUCT_COMPONENT_FOR_PROP]: state =>
    closeTopNestedConstructor(state),
  
  [PROJECT_SAVE_COMPONENT_FOR_PROP]: state => {
    const topConstructor = getTopNestedConstructor(state);
    state = closeTopNestedConstructor(state);
  
    const pathToCurrentComponents = getPathToCurrentComponents(state),
      currentComponents = state.getIn(pathToCurrentComponents);
  
    if (!currentComponents.has(topConstructor.componentId)) {
      throw new Error(
        'Failed to save component created by nested constructor: ' +
        'owner component is not in current editing area',
      );
    }
  
    const newValue = new JssyValue({
      source: 'designer',
      sourceData: new SourceDataDesigner({
        components: topConstructor.components,
        rootId: topConstructor.rootId,
      }),
    });
    
    const pathToProp = [].concat(
      pathToCurrentComponents,
      topConstructor.componentId,
      'props',
      topConstructor.prop,
    );
    
    return state.updateIn(
      pathToProp,
      propValue => topConstructor.path.length === 0
        ? newValue
        : propValue.setInStatic(topConstructor.path, newValue),
    );
  },
  
  [PROJECT_LINK_PROP]: (state, action) => state
    .merge({
      linkingProp: true,
      linkingPropOfComponentId: action.componentId,
      linkingPropName: action.propName,
    })
    .set('linkingPropPath', action.path), // Prevent conversion to List
  
  [PROJECT_LINK_WITH_OWNER_PROP]: (state, action) => {
    // Data prop with pushDataContext cannot be nested,
    // so we need to clearOutdatedDataProps only when updating top-level prop
    if (!state.linkingPropPath || !state.linkingPropPath.length) {
      state = clearOutdatedDataProps(
        state,
        state.linkingPropOfComponentId,
        state.linkingPropName,
      );
    }
    
    const pathToCurrentComponents = getPathToCurrentComponents(state);
    const pathToProp = [].concat(
      pathToCurrentComponents,
      state.linkingPropOfComponentId,
      'props',
      state.linkingPropName,
    );
    
    const oldValue = state.getIn(pathToProp).getInStatic(state.linkingPropPath);
    const newValue = new JssyValue({
      source: 'static',
      sourceData: new SourceDataStatic({
        value: oldValue.source === 'static'
          ? oldValue.sourceData.value
          : NO_VALUE, // TODO: Build default value for type when link will be removed
      
        ownerPropName: action.ownerPropName,
      }),
    });
    
    state = state.updateIn(
      pathToProp,
      propValue => state.linkingPropPath.length === 0
        ? newValue
        : propValue.setInStatic(state.linkingPropPath, newValue),
    );
    
    return initLinkingPropState(state);
  },
  
  [PROJECT_LINK_WITH_DATA]: (state, action) => {
    // Data prop with pushDataContext cannot be nested,
    // so we need to clearOutdatedDataProps only when updating top-level prop
    if (!state.linkingPropPath || !state.linkingPropPath.length) {
      state = clearOutdatedDataProps(
        state,
        state.linkingPropOfComponentId,
        state.linkingPropName,
      );
    }
    
    const pathToCurrentComponents = getPathToCurrentComponents(state);
    const pathToProp = [].concat(
      pathToCurrentComponents,
      state.linkingPropOfComponentId,
      'props',
      state.linkingPropName,
    );
    
    const newValue = new JssyValue({
      source: 'data',
      sourceData: new SourceDataData({
        dataContext: List(action.dataContext),
        queryPath: List(action.path.map(field => new QueryPathStep({
          field,
        }))),
      }),
    });
    
    const pathToQueryArgs = [
      ...getPathToComponentWithQueryArgs(state, action.dataContext),
      'queryArgs',
      action.dataContext.join(' '),
    ];
    
    state = state.setIn(pathToQueryArgs, action.args);
  
    state = state.updateIn(
      pathToProp,
      propValue => state.linkingPropPath.length === 0
        ? newValue
        : propValue.setInStatic(state.linkingPropPath, newValue),
    );
    
    return initLinkingPropState(state);
  },
  
  [PROJECT_LINK_PROP_CANCEL]: state => initLinkingPropState(state),
  
  [PREVIEW_DRAG_OVER_COMPONENT]: (state, action) => state.merge({
    draggingOverComponentId: action.componentId,
    draggingOverPlaceholder: false,
    placeholderContainerId: -1,
    placeholderAfter: -1,
  }),
  
  [PREVIEW_DRAG_OVER_PLACEHOLDER]: (state, action) => state.merge({
    draggingOverPlaceholder: true,
    placeholderContainerId: action.containerId,
    placeholderAfter: action.afterIdx,
  }),
  
  [STRUCTURE_SELECT_ROUTE]: (state, action) => state.merge({
    selectedRouteId: action.routeId,
    indexRouteSelected: action.indexRouteSelected,
  }),
  
  [APP_LOCALIZATION_LOAD_SUCCESS]: (state, action) =>
    state.set('languageForComponentProps', action.language),
  
  [LIBRARY_SHOW_ALL_COMPONENTS]: state =>
    state.set('showAllComponentsOnPalette', true),
};

export default (state = new ProjectState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
