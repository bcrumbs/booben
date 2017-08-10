/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Map, Set, List } from 'immutable';
import { resolveTypedef } from '@jssy/types';
import { LOCATION_CHANGE } from 'react-router-redux';
import { matchPath } from 'react-router';
import { PATH_DESIGN_ROUTE, PATH_DESIGN_ROUTE_INDEX } from '../constants/paths';

import {
  PROJECT_SAVE,
  PROJECT_SAVE_SUCCESS,
  PROJECT_SAVE_ERROR,
} from '../actions/project-save/actions';

import {
  PROJECT_REQUEST,
  PROJECT_LOADED,
  PROJECT_LOAD_FAILED,
  PROJECT_ROUTE_CREATE,
  PROJECT_ROUTE_DELETE,
  PROJECT_ROUTE_UPDATE_FIELD,
  PROJECT_ROUTE_UPDATE_PATH,
  PROJECT_MOVE_CURSOR,
  PROJECT_COMPONENT_CREATE,
  PROJECT_COMPONENT_DELETE,
  PROJECT_COMPONENT_RENAME,
  PROJECT_COMPONENT_TOGGLE_REGION,
  PROJECT_COMPONENT_COPY,
  PROJECT_COMPONENT_MOVE,
  PROJECT_COMPONENT_MOVE_TO_CLIPBOARD,
  PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT,
  PROJECT_COMPONENT_CONVERT_TO_LIST,
  PROJECT_CREATE_FUNCTION,
  PROJECT_JSSY_VALUE_REPLACE,
  PROJECT_JSSY_VALUE_ADD_ACTION,
  PROJECT_JSSY_VALUE_REPLACE_ACTION,
  PROJECT_JSSY_VALUE_DELETE_ACTION,
  PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT,
  PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_CANCEL,
  PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_SAVE,
  PROJECT_PICK_COMPONENT,
  PROJECT_PICK_COMPONENT_DONE,
  PROJECT_PICK_COMPONENT_CANCEL,
  PROJECT_PICK_COMPONENT_DATA,
  PROJECT_PICK_COMPONENT_DATA_CANCEL,
  PROJECT_UNDO,
  PROJECT_REDO,
  ComponentPickAreas,
} from '../actions/project';

import {
  PREVIEW_SELECT_COMPONENT,
  PREVIEW_DESELECT_COMPONENT,
  PREVIEW_TOGGLE_COMPONENT_SELECTION,
  PREVIEW_HIGHLIGHT_COMPONENT,
  PREVIEW_UNHIGHLIGHT_COMPONENT,
  PREVIEW_START_DRAG_NEW_COMPONENT,
  PREVIEW_START_DRAG_EXISTING_COMPONENT,
  PREVIEW_DROP_COMPONENT,
  PREVIEW_DRAG_OVER_PLACEHOLDER,
  PREVIEW_DRAG_OVER_NOTHING,
} from '../actions/preview';

import {
  APP_LOAD_STRINGS_SUCCESS,
} from '../actions/app';

import {
  STRUCTURE_SELECT_ROUTE,
} from '../actions/structure';

import {
  LIBRARY_SHOW_ALL_COMPONENTS,
} from '../actions/components-library';

import {
  DESIGN_TREE_EXPAND_ITEM,
  DESIGN_TREE_COLLAPSE_ITEM,
} from '../actions/design';

import RecordWithHistory from '../models/helpers/RecordWithHistory';
import Designer from '../models/Designer';
import ProjectRoute from '../models/ProjectRoute';

import JssyValue, {
  SourceDataDesigner,
  SourceDataRouteParams,
  Action,
} from '../models/JssyValue';

import ProjectFunction, {
  ProjectFunctionArgument,
  createJSFunction,
} from '../models/ProjectFunction';

import {
  projectToImmutable,
  getMaxRouteId,
  getMaxComponentId,
  gatherRoutesTreeIds,
} from '../models/Project';

import ProjectComponent, {
  jssyValueToImmutable,
} from '../models/ProjectComponent';

import {
  isRootComponent,
  isDeepChild,
  walkComponentsTree,
  gatherComponentsTreeIds,
  makeDetachedCopy,
  walkSimpleValues,
  convertComponentToList,
  getComponentPosition,
} from '../lib/components';

import {
  transformMetadata,
  getComponentMeta,
  constructComponent,
  propHasDataContext,
  isCompositeComponent,
  isAtomicComponent,
  buildDefaultValue,
} from '../lib/meta';

import {
  parseGraphQLSchema,
  getMutationField,
  getJssyValueDefOfMutationArgument,
} from '../lib/schema';

import { walkPath, expandPath, getObjectByPath } from '../lib/path';
import { isArrayOrList, isPrefixList, concatPath } from '../utils/misc';
import { getFunctionInfo } from '../lib/functions';

import {
  NOT_LOADED,
  LOADING,
  LOADED,
  LOAD_ERROR,
} from '../constants/load-states';

import {
  INVALID_ID,
  SYSTEM_PROPS,
  ROUTE_PARAM_VALUE_DEF,
} from '../constants/misc';

import { UNDO_HISTORY_LENGTH } from '../config';

export const NestedConstructor = RecordWithHistory({
  path: [],
  valueInfo: null,
  components: Map(),
  rootId: INVALID_ID,
  lastComponentId: INVALID_ID,
  designer: new Designer(),
}, [
  'components',
  'rootId',
  'lastComponentId',
  'designer.selectedComponentIds',
], {
  historyLength: UNDO_HISTORY_LENGTH,
});

const ProjectState = RecordWithHistory({
  projectName: '',
  loadState: NOT_LOADED,
  error: null,
  localRevision: 0,
  saving: false,
  savingRevision: 0,
  lastSavedRevision: 0,
  lastSaveTimestamp: 0,
  lastSaveError: null,
  data: null,
  schema: null,
  meta: null,
  lastRouteId: INVALID_ID,
  lastComponentId: INVALID_ID,
  designer: new Designer(),
  highlightingEnabled: true,
  showAllComponentsOnPalette: false,
  currentRouteId: INVALID_ID,
  currentRouteIsIndexRoute: false,
  draggingComponent: false,
  draggedComponentId: INVALID_ID,
  draggedComponents: null,
  draggingOverPlaceholder: false,
  placeholderContainerId: INVALID_ID,
  placeholderAfter: -1,
  selectedRouteId: INVALID_ID,
  indexRouteSelected: false,
  languageForComponentProps: 'en',
  selectingComponentLayout: false,
  nestedConstructors: List(),
  pickingComponent: false,
  pickingComponentData: false,
  pickingComponentFilter: null,
  pickingComponentDataGetter: null,
  pickedComponentId: INVALID_ID,
  pickedComponentArea: ComponentPickAreas.UNKNOWN,
  pickedComponentData: null,
  componentDataListIsVisible: false,
  componentDataListItems: [],
}, [
  'data',
  'lastRouteId',
  'lastComponentId',
  'selectedRouteId',
  'indexRouteSelected',
  'designer.selectedComponentIds',
], {
  historyLength: UNDO_HISTORY_LENGTH,
});

const initDNDState = state => state.merge({
  draggingComponent: false,
  draggedComponents: null,
  draggedComponentId: INVALID_ID,
  draggingOverPlaceholder: false,
  placeholderContainerId: INVALID_ID,
  placeholderAfter: -1,
  highlightingEnabled: true,
});

const initComponentPickingState = state => state.merge({
  pickingComponent: false,
  pickingComponentData: false,
  pickingComponentFilter: null,
  pickingComponentDataGetter: null,
  pickedComponentId: INVALID_ID,
  pickedComponentArea: ComponentPickAreas.UNKNOWN,
  pickedComponentData: null,
  componentDataListIsVisible: false,
  componentDataListItems: [],
});

const haveNestedConstructors = state => !state.nestedConstructors.isEmpty();

const getTopNestedConstructor = state =>
  state.nestedConstructors.first() || null;

const getPathToCurrentComponents = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0, 'components']
  : ['data', 'routes', state.currentRouteId, 'components'];

const getPathToCurrentRootComponentId = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0, 'rootId']
  : [
    'data',
    'routes',
    state.currentRouteId,
    state.currentRouteIsIndexRoute ? 'indexComponent' : 'component',
  ];

const getPathToCurrentDesigner = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0, 'designer']
  : ['designer'];

const getPathToCurrentHistoryNode = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0]
  : [];

const getPathToPreviousHistoryNode = state => state.nestedConstructors.size > 1
  ? ['nestedConstructors', 1]
  : [];

const getDesigner = state => state.getIn(getPathToCurrentDesigner(state));

const updateDesigner = (state, updater) =>
  state.updateIn(getPathToCurrentDesigner(state), updater);

const getPathToLastComponentId = state => haveNestedConstructors(state)
  ? ['nestedConstructors', 0, 'lastComponentId']
  : ['lastComponentId'];

const addNewComponents = (
  state,
  containerId,
  afterIdx,
  components,
  updateCursorPosition = false,
) => {
  const pathToLastComponentId = getPathToLastComponentId(state);
  const lastComponentId = state.getIn(pathToLastComponentId);
  const rootComponentId = lastComponentId === INVALID_ID
    ? 0
    : lastComponentId + 1;

  const pathToCurrentComponents = getPathToCurrentComponents(state);
  const rootComponent = components.get(0);
  const position = afterIdx + 1;
  let maxId = 0;
  
  state = state.updateIn(
    pathToCurrentComponents,

    updatedComponents => updatedComponents.withMutations(mut => {
      components.forEach(newComponent => {
        const id = newComponent.id + rootComponentId;
        if (id > maxId) maxId = id;
        
        const insertedComponent = newComponent
          .merge({
            id,
            isNew: false,
            parentId: newComponent.parentId === INVALID_ID
              ? containerId
              : newComponent.parentId + rootComponentId,

            routeId: state.currentRouteId,
            isIndexRoute: state.currentRouteIsIndexRoute,
          })
          .update(
            'children',
            childIds => childIds.map(id => id + rootComponentId),
          );

        mut.set(id, insertedComponent);
      });
    }),
  );

  if (containerId !== INVALID_ID) {
    // Inserting non-root component
    const pathToChildrenIdsList = [].concat(pathToCurrentComponents, [
      containerId,
      'children',
    ]);

    state = state.updateIn(
      pathToChildrenIdsList,
      childComponentIds => childComponentIds.insert(position, rootComponentId),
    );
  } else {
    // Inserting root component
    state = state.setIn(
      getPathToCurrentRootComponentId(state),
      rootComponentId,
    );
  }

  if (isCompositeComponent(rootComponent.name, state.meta)) {
    // If the new component is composite, expand it in the tree view
    state = updateDesigner(state, designer =>
      designer.expandTreeItem(rootComponentId));
  }
  
  state = state.setIn(pathToLastComponentId, maxId);
  
  if (updateCursorPosition) {
    if (containerId === INVALID_ID) {
      if (!isAtomicComponent(rootComponent.name, state.meta)) {
        // Set cursor position inside newly created root component
        state = updateDesigner(state, designer => designer.setCursorPosition(
          state.getIn(getPathToCurrentRootComponentId(state)),
          -1,
        ));
      }
    } else {
      // Set cursor position after newly created component
      state = updateDesigner(state, designer => designer.setCursorPosition(
        containerId,
        position,
      ));
    }
  }
  
  return state;
};

const deleteOutdatedActions = (state, component, deletedComponentIds) => {
  const start = {
    object: component,
    expandedPath: [],
  };

  const componentMeta = getComponentMeta(component.name, state.meta);
  let actionsToDelete = Map();

  const visitAction = (action, stepsToActionsList, actionIdx) => {
    if (action.type === 'method' || action.type === 'prop') {
      if (deletedComponentIds.has(action.params.componentId)) {
        if (actionsToDelete.has(stepsToActionsList)) {
          actionsToDelete = actionsToDelete.update(
            stepsToActionsList,
            indexes => indexes.add(actionIdx),
          );
        } else {
          actionsToDelete = actionsToDelete.set(
            stepsToActionsList,
            Set([actionIdx]),
          );
        }
      }
    } else if (action.type === 'mutation' || action.type === 'ajax') {
      const stepsToSuccessActionsList =
        [...stepsToActionsList, actionIdx, 'successActions'];

      const stepsToErrorActionsList =
        [...stepsToActionsList, actionIdx, 'errorActions'];

      action.params.successActions.forEach((successAction, idx) => {
        visitAction(successAction, stepsToSuccessActionsList, idx);
      });

      action.params.errorActions.forEach((errorAction, idx) => {
        visitAction(errorAction, stepsToErrorActionsList, idx);
      });
    }
  };

  walkSimpleValues(component, componentMeta, (propValue, _, steps) => {
    if (propValue.source === 'actions') {
      const stepsToActionsList = [...steps, 'actions'];

      propValue.sourceData.actions.forEach((action, idx) => {
        visitAction(action, stepsToActionsList, idx);
      });
    }
  });

  actionsToDelete.forEach((indexes, steps) => {
    component = component.updateIn(
      expandPath({ start, steps }),
      actions => actions.filter((_, idx) => !indexes.has(idx)),
    );
  });

  return component;
};

const resetOutdatedStateValues = (state, component, deletedComponentIds) => {
  const start = {
    object: component,
    expandedPath: [],
  };

  const componentMeta = getComponentMeta(component.name, state.meta);

  const walkSimpleValueOptions = {
    walkSystemProps: true,
    walkActions: true,
    walkFunctionArgs: true,
    walkDesignerValues: false,
    project: state.data,
    schema: state.schema,
    meta: state.meta,
  };

  const visitValue = (jssyValue, valueDef, steps) => {
    const willResetValue =
      jssyValue.isLinkedWithState() &&
      deletedComponentIds.has(jssyValue.sourceData.componentId);

    if (willResetValue) {
      const physicalPath = expandPath({ start, steps });
      const newValue = jssyValueToImmutable(buildDefaultValue(
        valueDef,
        component.strings,
        state.languageForComponentProps,
        component.types,
        { forceEnable: true },
      ));

      component = component.setIn(physicalPath, newValue);
    }
  };

  walkSimpleValues(
    component,
    componentMeta,
    visitValue,
    walkSimpleValueOptions,
  );

  return component;
};

/**
 *
 * @param {Object} state
 * @param {number} componentId
 * @return {Object}
 */
const deleteComponent = (state, componentId) => {
  const pathToCurrentComponents = getPathToCurrentComponents(state);
  const pathToCurrentRootComponentId = getPathToCurrentRootComponentId(state);
  const currentComponents = state.getIn(pathToCurrentComponents);
  const component = currentComponents.get(componentId);
  const deletedComponentIds = gatherComponentsTreeIds(
    currentComponents,
    componentId,
  );
  
  const haveState = deletedComponentIds.some(id => {
    const component = currentComponents.get(id);
    const componentMeta = getComponentMeta(component.name, state.meta);
    return !!componentMeta.state && Object.keys(componentMeta.state).length > 0;
  });
  
  // Update cursor position
  if (isRootComponent(component)) {
    state = updateDesigner(state, designer => designer.setCursorPosition(
      INVALID_ID,
      -1,
    ));
  } else {
    const designer = getDesigner(state);
    const cursorIsInsideDeletedSubtree =
      designer.cursorContainerId === componentId ||
      isDeepChild(
        currentComponents,
        designer.cursorContainerId,
        componentId,
      );
    
    if (cursorIsInsideDeletedSubtree) {
      const parentComponent = currentComponents.get(component.parentId);
      const deletedComponentPosition =
        parentComponent.children.indexOf(componentId);
  
      state = updateDesigner(state, designer => designer.setCursorPosition(
        component.parentId,
        deletedComponentPosition - 1,
      ));
    }
  }

  // Delete components from map
  state = state.updateIn(
    pathToCurrentComponents,

    components => components.withMutations(componentsMut => {
      deletedComponentIds.forEach(id => {
        componentsMut.delete(id);
      });
    }),
  );

  if (isRootComponent(component)) {
    // If the root component is being deleted, reset the root component id field
    state = state.setIn(pathToCurrentRootComponentId, INVALID_ID);
  } else {
    // Otherwise update children of the parent component
    const pathToChildrenIdsList = [].concat(pathToCurrentComponents, [
      component.parentId,
      'children',
    ]);

    state = state.updateIn(
      pathToChildrenIdsList,
      children => children.filter(id => id !== componentId),
    );
  }
  
  // Update remaining components
  state = state.updateIn(
    pathToCurrentComponents,
    
    components => components.map(component => {
      component = deleteOutdatedActions(state, component, deletedComponentIds);

      if (haveState) {
        component = resetOutdatedStateValues(
          state,
          component,
          deletedComponentIds,
        );
      }
      
      return component;
    }),
  );

  return state;
};

const moveComponent = (state, componentId, containerId, afterIdx) => {
  const pathToCurrentComponents = getPathToCurrentComponents(state);
  const components = state.getIn(pathToCurrentComponents);

  if (!components.has(componentId) || !components.has(containerId)) {
    return state;
  }

  const component = components.get(componentId);
  const targetPosition = afterIdx + 1;
  
  // Update cursor position
  const designer = getDesigner(state);
  if (designer.cursorContainerId === component.parentId) {
    const parentComponent = components.get(component.parentId);
    const position = parentComponent.children.indexOf(componentId);
    if (designer.cursorAfter >= position) {
      state = updateDesigner(state, designer => designer.setCursorPosition(
        designer.cursorContainerId,
        designer.cursorAfter - 1,
      ));
    }
  }

  if (component.parentId === containerId) {
    // Same parent, just change the position
    return state.updateIn(
      [...pathToCurrentComponents, component.parentId, 'children'],
      
      ids => {
        const idx = ids.indexOf(componentId);
        
        if (idx === targetPosition) return ids;
  
        return ids
          .delete(idx)
          .insert(targetPosition - (idx < targetPosition), componentId);
      },
    );
  } else {
    // New parent
    state = state.updateIn(
      [...pathToCurrentComponents, component.parentId, 'children'],
      ids => ids.filter(id => id !== componentId),
    );
  
    state = state.updateIn(
      [...pathToCurrentComponents, containerId, 'children'],
      ids => ids.insert(targetPosition, componentId),
    );
  
    return state.setIn(
      [...pathToCurrentComponents, componentId, 'parentId'],
      containerId,
    );
  }
};

const copyComponent = (state, componentId, containerId, afterIdx) => {
  const pathToCurrentComponents = getPathToCurrentComponents(state);
  const currentComponents = state.getIn(pathToCurrentComponents);

  if (
    !currentComponents.has(componentId) ||
    !currentComponents.has(containerId)
  ) {
    return state;
  }

  const componentsCopy = makeDetachedCopy(
    currentComponents,
    componentId,
    state.meta,
    state.data,
    state.schema,
  );
  
  return addNewComponents(state, containerId, afterIdx, componentsCopy);
};

const insertDraggedComponents = (state, components) => addNewComponents(
  state,
  state.placeholderContainerId,
  state.placeholderAfter,
  components,
  true,
);

const selectFirstRoute = state => state.merge({
  selectedRouteId: state.data.rootRoutes.size > 0
    ? state.data.rootRoutes.get(0)
    : INVALID_ID,

  indexRouteSelected: false,
});

/**
 * @typedef {Object} ProjectPath
 * @property {number} startingPoint
 * @property {(string|number)[]} steps
 */

/**
 *
 * @type {Object<string, number>}
 */
export const PathStartingPoints = {
  PROJECT: 0,
  CURRENT_COMPONENTS: 1,
};

/**
 *
 * @param {number} startingPoint
 * @param {Object} state
 * @return {{ object: *, expandedPath: (string|number)[] }}
 */
const getPathStartingPoint = (startingPoint, state) => {
  switch (startingPoint) {
    case PathStartingPoints.PROJECT: {
      return { object: state.data, expandedPath: [] };
    }
    
    case PathStartingPoints.CURRENT_COMPONENTS: {
      const pathToCurrentComponents = getPathToCurrentComponents(state);
      return {
        object: state.getIn(pathToCurrentComponents),
        expandedPath: pathToCurrentComponents,
      };
    }
    
    default: {
      throw new Error(
        `getPathStartingPoint(): Invalid starting point: ${startingPoint}`,
      );
    }
  }
};

/**
 *
 * @param {ProjectPath} projectPath
 * @param {Object} state
 * @return {Path}
 */
const materializePath = (projectPath, state) => ({
  start: getPathStartingPoint(projectPath.startingPoint, state),
  steps: projectPath.steps,
});

const ValueTypes = {
  NOT_A_VALUE: 0,
  COMPONENT_PROP: 1,
  COMPONENT_SYSTEM_PROP: 2,
  FUNCTION_ARG: 3,
  QUERY_ARG: 4,
  ACTION_METHOD_ARG: 5,
  ACTION_MUTATION_ARG: 6,
  ACTION_PROP_VALUE: 7,
  ACTION_ROUTE_PARAM: 8,
};

/**
 * @typedef {Object} ValueInfo
 * @property {number} type
 * @property {boolean} isNested
 * @property {JssyValueDefinition} valueDef
 * @property {Object<string, JssyTypeDefinition>} userTypedefs
 */

/**
 *
 * @param {ProjectPath} path
 * @param {Object} state
 * @return {ValueInfo}
 */
const getValueInfoByPath = (path, state) => {
  const project = state.data;
  
  let currentComponents = null;
  let componentMeta = null;
  let userTypedefs = null;
  let currentValueDef = null;
  let currentValueType = ValueTypes.NOT_A_VALUE;
  let currentIsNested = false;
  let nextValueType = ValueTypes.NOT_A_VALUE;
  let currentFunction = null;
  let currentAction = null;
  
  if (path.startingPoint === PathStartingPoints.CURRENT_COMPONENTS) {
    currentComponents = state.getIn(getPathToCurrentComponents(state));
  }
  
  walkPath(materializePath(path, state), (object, idx) => {
    if (idx === -1) return;
    
    const step = path.steps[idx];
    const nextStep = path.steps.length === idx + 1 ? null : path.steps[idx + 1];
  
    if (object instanceof JssyValue) {
      if (object.source === 'function') {
        currentFunction = getFunctionInfo(
          object.sourceData.functionSource,
          object.sourceData.function,
          project.functions,
        );
        
        if (nextStep === 'args') {
          nextValueType = ValueTypes.FUNCTION_ARG;
        }
      } else if (object.source === 'designer') {
        currentComponents = object.sourceData.components;
      }
      
      if (currentValueType === ValueTypes.NOT_A_VALUE) {
        currentValueType = nextValueType;
        
        if (currentValueType === ValueTypes.COMPONENT_PROP) {
          currentValueDef = componentMeta.props[step];
          userTypedefs = componentMeta.types;
        } else if (currentValueType === ValueTypes.COMPONENT_SYSTEM_PROP) {
          currentValueDef = SYSTEM_PROPS[step];
          userTypedefs = null;
        } else if (currentValueType === ValueTypes.QUERY_ARG) {
          // TODO: Get valueDef
          currentValueDef = null;
          userTypedefs = null;
        } else if (currentValueType === ValueTypes.FUNCTION_ARG) {
          currentValueDef = currentFunction.args
            .find(argDef => argDef.name === step);
  
          userTypedefs = null;
        } else if (currentValueType === ValueTypes.ACTION_MUTATION_ARG) {
          const mutation =
            getMutationField(state.schema, currentAction.mutation);
          
          const arg = mutation.args[step];
  
          currentValueDef = getJssyValueDefOfMutationArgument(
            arg,
            state.schema,
          );
          
          userTypedefs = null;
        } else if (currentValueType === ValueTypes.ACTION_METHOD_ARG) {
          const targetComponent =
            currentComponents.get(currentAction.params.componentId);
          
          const targetComponentMeta =
            getComponentMeta(targetComponent.name, state.meta);
          
          currentValueDef =
            targetComponentMeta.methods[currentAction.params.method].args[step];
          
          userTypedefs = targetComponentMeta.types;
        } else if (currentValueType === ValueTypes.ACTION_PROP_VALUE) {
          if (currentAction.params.systemPropName) {
            currentValueDef = SYSTEM_PROPS[currentAction.params.systemPropName];
            userTypedefs = null;
          } else {
            const targetComponent =
              currentComponents.get(currentAction.params.componentId);
  
            const targetComponentMeta =
              getComponentMeta(targetComponent.name, state.meta);
  
            currentValueDef =
              targetComponentMeta.props[currentAction.params.propName];
  
            userTypedefs = targetComponentMeta.types;
          }
        } else if (currentValueType === ValueTypes.ACTION_ROUTE_PARAM) {
          currentValueDef = ROUTE_PARAM_VALUE_DEF;
          userTypedefs = null;
        }
      } else {
        currentIsNested = true;
        
        const resolvedTypedef = resolveTypedef(currentValueDef, userTypedefs);
      
        if (resolvedTypedef.type === 'shape') {
          currentValueDef = resolvedTypedef.fields[step];
        } else if (
          resolvedTypedef.type === 'arrayOf' ||
          resolvedTypedef.type === 'objectOf'
        ) {
          currentValueDef = resolvedTypedef.ofType;
        }
      }
    } else {
      currentValueType = ValueTypes.NOT_A_VALUE;
      currentIsNested = false;
      currentValueDef = null;
  
      if (object instanceof ProjectRoute) {
        if (nextStep === 'components') {
          currentComponents = object.components;
        }
      } else if (object instanceof ProjectComponent) {
        componentMeta = getComponentMeta(object.name, state.meta);
        
        if (nextStep === 'props') {
          nextValueType = ValueTypes.COMPONENT_PROP;
        } else if (nextStep === 'systemProps') {
          nextValueType = ValueTypes.COMPONENT_SYSTEM_PROP;
        } else if (nextStep === 'queryArgs') {
          nextValueType = ValueTypes.QUERY_ARG;
        }
      } else if (object instanceof Action) {
        currentAction = object;
        
        if (object.type === 'mutation' && nextStep === 'args') {
          nextValueType = ValueTypes.ACTION_MUTATION_ARG;
        } else if (object.type === 'method' && nextStep === 'args') {
          nextValueType = ValueTypes.ACTION_METHOD_ARG;
        } else if (object.type === 'prop' && nextStep === 'value') {
          nextValueType = ValueTypes.ACTION_PROP_VALUE;
        } else if (object.type === 'navigate' && nextStep === 'routeParams') {
          nextValueType = ValueTypes.ACTION_ROUTE_PARAM;
        }
      }
    }
  });
  
  return {
    type: currentValueType,
    isNested: currentIsNested,
    valueDef: currentValueDef,
    userTypedefs,
  };
};

/**
 *
 * @param {Object} state
 * @param {ProjectPath} updatedPath
 * @return {Object}
 */
const clearOutdatedDataProps = (state, updatedPath) => {
  const { valueType, isNested } = getValueInfoByPath(updatedPath, state);

  // Data props with pushDataContext cannot be nested,
  // so we need to clear outdated data props only when updating top-level prop
  if (valueType !== ValueTypes.COMPONENT_PROP || isNested) return state;
  
  const oldValue = getObjectByPath(materializePath(updatedPath, state));
  if (!oldValue.isLinkedWithData()) return state;
  
  const pathToComponents = getPathToCurrentComponents(state);
  const currentComponents = state.getIn(pathToComponents);
  const updatedPropName = updatedPath.steps[updatedPath.steps.length - 1];
  const updatedComponentId = updatedPath.steps[updatedPath.steps.length - 2];
  const updatedComponent = currentComponents.get(updatedComponentId);
  const pathToUpdatedComponent = [...pathToComponents, updatedComponentId];
  const componentMeta = getComponentMeta(updatedComponent.name, state.meta);
  const updatedPropMeta = componentMeta.props[updatedPropName];
  
  if (!propHasDataContext(updatedPropMeta)) return state;
  
  const outdatedDataContext = oldValue.sourceData.dataContext
    .push(updatedPropMeta.sourceConfigs.data.pushDataContext);
  
  const visitDesignerValue = (designerValue, physicalPath) => {
    const pathStart = {
      object: designerValue,
      expandedPath: physicalPath,
    };

    const visitComponent = component => {
      const componentId = component.id;
      const componentMeta = getComponentMeta(component.name, state.meta);

      const visitValue = (propValue, _, steps) => {
        if (propValue.isLinkedWithData()) {
          const containsOutdatedDataContext = isPrefixList(
            outdatedDataContext,
            propValue.sourceData.dataContext,
          );

          if (containsOutdatedDataContext) {
            const physicalPath = expandPath({
              start: pathStart,
              steps: ['components', componentId, ...steps],
            });

            state = state.updateIn(
              physicalPath,
              updatedValue => updatedValue.resetDataLink(),
            );
          }
        } else if (propValue.hasDesignedComponent()) {
          const pathToNextDesignerValue = expandPath({
            start: pathStart,
            steps: ['components', componentId, ...steps],
          });

          visitDesignerValue(
            state.getIn(pathToNextDesignerValue),
            pathToNextDesignerValue,
          );
        }
      };
      
      const walkSimpleValuesOptions = {
        walkActions: true,
        walkFunctionArgs: true,
        walkSystemProps: true,
        walkDesignerValues: false,
        project: state.data,
        schema: state.schema,
        meta: state.meta,
      };

      walkSimpleValues(
        component,
        componentMeta,
        visitValue,
        walkSimpleValuesOptions,
      );
    };

    walkComponentsTree(
      designerValue.sourceData.components,
      designerValue.sourceData.rootId,
      visitComponent,
    );
  };

  const start = {
    object: updatedComponent,
    expandedPath: pathToUpdatedComponent,
  };
  
  walkSimpleValues(updatedComponent, componentMeta, (propValue, _, steps) => {
    if (propValue.hasDesignedComponent()) {
      visitDesignerValue(propValue, expandPath({ start, steps }));
    }
  });

  return state;
};

const updateValue = (state, path, newValue) => {
  state = clearOutdatedDataProps(state, path);
  
  const physicalPath = expandPath(materializePath(path, state));
  
  return newValue
    ? state.setIn(physicalPath, newValue)
    : state.deleteIn(physicalPath);
};

const openNestedConstructor = (state, path, components, rootId) => {
  const nestedConstructorInit = {
    path,
    valueInfo: getValueInfoByPath(path, state),
  };
  
  const designerInit = {};
  
  if (rootId !== INVALID_ID) {
    const rootComponent = components.get(rootId);
    const cursorContainerId = isAtomicComponent(rootComponent.name, state.meta)
      ? INVALID_ID
      : rootComponent.id;
    
    Object.assign(designerInit, {
      cursorContainerId,
      cursorAfter: -1,
      expandedTreeItemIds: Set([rootId]),
    });
    
    Object.assign(nestedConstructorInit, {
      components,
      rootId,
      lastComponentId: components.keySeq().max(),
    });
  }
  
  nestedConstructorInit.designer = new Designer(designerInit);
  
  return state.update('nestedConstructors', nestedConstructors =>
    nestedConstructors.unshift(new NestedConstructor(nestedConstructorInit)));
};

const closeTopNestedConstructor = state => state.update(
  'nestedConstructors',
  nestedConstructors => nestedConstructors.shift(),
);

const closeAllNestedConstructors = state =>
  state.set('nestedConstructors', List());

const initMainDesigner = state => {
  if (state.currentRouteId === INVALID_ID) return state;
  
  const route = state.data.routes.get(state.currentRouteId);
  const rootComponentId = state.currentRouteIsIndexRoute
    ? route.indexComponent
    : route.component;
  
  const rootComponent = rootComponentId === INVALID_ID
    ? null
    : route.components.get(rootComponentId);
  
  const willUpdateCursor =
    rootComponent !== null &&
    !isAtomicComponent(rootComponent.name, state.meta);
  
  const expandedTreeItemIds = rootComponentId === INVALID_ID
    ? Set()
    : Set([rootComponentId]);
  
  return state.update('designer', designer => {
    if (willUpdateCursor) {
      designer = designer.setCursorPosition(rootComponentId, -1);
    }
    
    return designer.set('expandedTreeItemIds', expandedTreeItemIds);
  });
};

const setCurrentRoute = (state, routeId, isIndexRoute) => {
  state = closeAllNestedConstructors(state);
  state = state.update('designer', designer => designer.reset());
  
  state = state.merge({
    currentRouteId: routeId,
    currentRouteIsIndexRoute: isIndexRoute,
  });

  if (state.loadState === LOADED) {
    state = initMainDesigner(state);
  }

  return state;
};

const incrementRevision = state => state.update(
  'localRevision',
  localRevision => localRevision + 1,
);

const incrementsRevision = fn => (state, action) =>
  incrementRevision(fn(state, action));

const updateHistory = (state, getPathToNodeWithHistory) => state.updateIn(
  getPathToNodeWithHistory(state),
  record => record.pushHistoryEntry(),
);

const _undoable = getPathToNodeWithHistory => fn => (state, action) => fn(
  updateHistory(state, getPathToNodeWithHistory),
  action,
);

const undoable = _undoable(getPathToCurrentHistoryNode);
const undoableInPreviousNode = _undoable(getPathToPreviousHistoryNode);


const handlers = {
  [LOCATION_CHANGE]: (state, action) => {
    state = closeAllNestedConstructors(state);
    state = state.resetHistory();
    
    const pathname = action.payload.pathname;
    
    const designRouteMatch = matchPath(pathname, {
      path: PATH_DESIGN_ROUTE,
      exact: true,
      strict: false,
    });
    
    if (designRouteMatch) {
      const routeId = parseInt(designRouteMatch.params.routeId, 10);
      return setCurrentRoute(state, routeId, false);
    }
    
    const designRouteIndexMatch = matchPath(pathname, {
      path: PATH_DESIGN_ROUTE_INDEX,
      exact: true,
      strict: false,
    });
    
    if (designRouteIndexMatch) {
      const routeId = parseInt(designRouteIndexMatch.params.routeId, 10);
      return setCurrentRoute(state, routeId, true);
    }
    
    return state;
  },
  
  [PROJECT_REQUEST]: (state, action) => state.merge({
    projectName: action.projectName,
    loadState: LOADING,
  }),
  
  [PROJECT_LOADED]: (state, action) => {
    const project = projectToImmutable(action.project);
    
    const isInvalidRoute =
      state.currentRouteId !== INVALID_ID &&
      !project.routes.has(state.currentRouteId);
    
    if (isInvalidRoute) {
      return state.merge({
        loadState: LOAD_ERROR,
        error: new Error('Invalid route'),
      });
    }
  
    state = state
      .set('meta', transformMetadata(action.metadata))
      .set('schema', action.schema ? parseGraphQLSchema(action.schema) : null)
      .merge({
        projectName: action.project.name,
        loadState: LOADED,
        data: project,
        error: null,
        lastRouteId: getMaxRouteId(project),
        lastComponentId: getMaxComponentId(project),
      });

    return initMainDesigner(selectFirstRoute(state));
  },

  [PROJECT_LOAD_FAILED]: (state, action) => state.merge({
    loadState: LOAD_ERROR,
    error: action.error,
  }),
  
  [PROJECT_SAVE]: state => state.merge({
    saving: true,
    savingRevision: state.localRevision,
  }),
  
  [PROJECT_SAVE_SUCCESS]: state => state.merge({
    saving: false,
    lastSavedRevision: state.savingRevision,
    lastSaveError: null,
    lastSaveTimestamp: Date.now(),
  }),
  
  [PROJECT_SAVE_ERROR]: (state, action) => state.merge({
    saving: false,
    lastSaveError: action.error,
  }),
  
  [PROJECT_ROUTE_CREATE]: undoable(incrementsRevision((state, action) => {
    const newRouteId = state.lastRouteId === INVALID_ID
      ? 0
      : state.lastRouteId + 1;
  
    const parentRoute = action.parentRouteId === INVALID_ID
      ? null
      : state.data.routes.get(action.parentRouteId);
  
    const fullPath = parentRoute
      ? concatPath(parentRoute.fullPath, action.path)
      : action.path;
  
    const newRoute = new ProjectRoute({
      id: newRouteId,
      parentId: action.parentRouteId,
      path: action.path,
      fullPath,
      title: action.title,
      paramValues: Map(action.paramValues),
    });
  
    state = state.setIn(['data', 'routes', newRouteId], newRoute);
  
    const pathToIdsList = action.parentRouteId === INVALID_ID
      ? ['data', 'rootRoutes']
      : ['data', 'routes', action.parentRouteId, 'children'];
  
    return state
      .updateIn(pathToIdsList, list => list.push(newRouteId))
      .merge({
        lastRouteId: newRouteId,
        selectedRouteId: newRouteId,
        indexRouteSelected: false,
      });
  })),
  
  [PROJECT_ROUTE_DELETE]: undoable(incrementsRevision((state, action) => {
    const deletedRoute = state.data.routes.get(action.routeId);
    const deletedRouteIds = gatherRoutesTreeIds(state.data, action.routeId);
  
    // Delete routes
    state = state.updateIn(
      ['data', 'routes'],
      routes => routes.filter(route => !deletedRouteIds.has(route.id)),
    );
  
    // Update rootRoutes or parent's children list
    const pathToIdsList = deletedRoute.parentId === INVALID_ID
      ? ['data', 'rootRoutes']
      : ['data', 'routes', deletedRoute.parentId, 'children'];
  
    state = state.updateIn(
      pathToIdsList,
      routeIds => routeIds.filter(routeId => routeId !== action.routeId),
    );
  
    // Update selected route
    const deletedRouteIsSelected =
      state.selectedRouteId !== INVALID_ID &&
      deletedRouteIds.has(state.selectedRouteId);
  
    if (deletedRouteIsSelected) state = selectFirstRoute(state);
    return state;
  })),
  
  [PROJECT_ROUTE_UPDATE_FIELD]: undoable(incrementsRevision(
    (state, action) => state.setIn(
      ['data', 'routes', action.routeId, action.field],
      action.newValue,
    ),
  )),

  [PROJECT_ROUTE_UPDATE_PATH]: undoable(incrementsRevision((state, action) => {
    const walkSimpleValuesOptions = {
      walkSystemProps: true,
      walkActions: true,
      walkFunctionArgs: true,
      walkDesignerValues: true,
      project: state.data,
      schema: state.schema,
      meta: state.meta,
    };
    
    state = state.updateIn(
      ['data', 'routes', action.routeId, 'components'],
      
      components => components.map(component => {
        const componentMeta = getComponentMeta(component.name, state.meta);
        const start = {
          object: component,
          expandedPath: [],
        };
        
        const visitValue = (jssyValue, valueDef, steps) => {
          const isCandidateValue =
            jssyValue.isLinkedWithRouteParam() &&
            jssyValue.sourceData.routeId === action.routeId;

          if (!isCandidateValue) return;

          const paramName = jssyValue.sourceData.paramName;

          if (action.renamedParams[paramName]) {
            const newValue = new JssyValue({
              source: 'routeParams',
              sourceData: new SourceDataRouteParams({
                routeId: action.routeId,
                paramName: action.renamedParams[paramName],
              }),
            });

            component = component.setIn(expandPath({ start, steps }), newValue);
          } else if (!action.newParamValues[paramName]) {
            const newValue = jssyValueToImmutable(buildDefaultValue(
              valueDef,
              component.strings,
              state.languageForComponentProps,
              component.types,
              { forceEnable: true },
            ));

            component = component.setIn(expandPath({ start, steps }), newValue);
          }
        };
        
        walkSimpleValues(
          component,
          componentMeta,
          visitValue,
          walkSimpleValuesOptions,
        );
        
        return component;
      }),
    );
    
    return state.mergeIn(['data', 'routes', action.routeId], {
      path: action.newPath,
      paramValues: Map(action.newParamValues),
    });
  })),

  [PROJECT_COMPONENT_CREATE]: undoable(incrementsRevision(
    (state, action) => addNewComponents(
      state,
      action.containerId,
      action.afterIdx,
      action.components,
      action.updateCursorPosition,
    ),
  )),
  
  [PROJECT_COMPONENT_DELETE]: undoable(incrementsRevision((state, action) => {
    state = updateDesigner(state, designer =>
      designer.forgetComponent(action.componentId));
  
    if (state.draggedComponentId === action.componentId) {
      state = initDNDState(state);
    }
  
    return deleteComponent(state, action.componentId);
  })),
  
  [PROJECT_COMPONENT_COPY]: undoable(incrementsRevision(
    (state, action) => copyComponent(
      state,
      action.componentId,
      action.containerId,
      action.afterIdx,
    ),
  )),
  
  [PROJECT_COMPONENT_MOVE]: undoable(incrementsRevision(
    (state, action) => moveComponent(
      action.clearClipboard
        ? updateDesigner(state, designer => designer.clearClipboard())
        : state,
      
      action.componentId,
      action.containerId,
      action.afterIdx,
    ),
  )),

  [PROJECT_COMPONENT_MOVE_TO_CLIPBOARD]: (state, action) =>
    updateDesigner(state, designer =>
      designer.updateClipboard(action.componentId, action.copy)),
  
  [PROJECT_COMPONENT_CONVERT_TO_LIST]: undoable(incrementsRevision(
    (state, action) => {
      state = updateDesigner(state, designer =>
        designer.forgetComponent(action.componentId));
  
      if (state.draggedComponentId === action.componentId) {
        state = initDNDState(state);
      }
      
      const pathToCurrentComponents = getPathToCurrentComponents(state);
      const components = state.getIn(pathToCurrentComponents);
      const { containerId, afterIdx } = getComponentPosition(
        components,
        action.componentId,
      );
    
      const list = convertComponentToList(
        components,
        action.componentId,
        state.meta,
        state.data,
        state.schema,
      );
    
      state = deleteComponent(state, action.componentId);
      
      const pathToLastComponentId = getPathToLastComponentId(state);
      const lastComponentId = state.getIn(pathToLastComponentId);
      const newComponentId = lastComponentId + 1;
      
      state = addNewComponents(state, containerId, afterIdx, list);
      
      return updateDesigner(state, designer =>
        designer.selectComponentExclusive(newComponentId));
    },
  )),
  
  [PROJECT_JSSY_VALUE_REPLACE]: undoable(incrementsRevision(
    (state, action) => updateValue(state, action.path, action.newValue),
  )),
  
  [PROJECT_JSSY_VALUE_ADD_ACTION]: undoable(incrementsRevision(
    (state, action) => state.updateIn(
      expandPath(materializePath(action.path, state)),
      actionsList => actionsList.push(action.action),
    ),
  )),
  
  [PROJECT_JSSY_VALUE_REPLACE_ACTION]: undoable(incrementsRevision(
    (state, action) => state.updateIn(
      expandPath(materializePath(action.path, state)),
      actionsList => actionsList.set(action.index, action.newAction),
    ),
  )),
  
  [PROJECT_JSSY_VALUE_DELETE_ACTION]: undoable(incrementsRevision(
    (state, action) => state.updateIn(
      expandPath(materializePath(action.path, state)),
      actionsList => actionsList.delete(action.index),
    ),
  )),
  
  [PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT]: (state, action) => {
    if (action.path.startingPoint !== PathStartingPoints.CURRENT_COMPONENTS) {
      throw new Error('Cannot open nested constructor with absolute path');
    }
    
    const currentValue = getObjectByPath(materializePath(action.path, state));
    
    if (currentValue.hasDesignedComponent()) {
      return openNestedConstructor(
        state,
        action.path,
        currentValue.sourceData.components,
        currentValue.sourceData.rootId,
      );
    } else if (action.components) {
      return openNestedConstructor(
        state,
        action.path,
        action.components,
        action.rootId,
      );
    } else {
      return openNestedConstructor(
        state,
        action.path,
        null,
        INVALID_ID,
      );
    }
  },
  
  [PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_CANCEL]: state =>
    closeTopNestedConstructor(state),
  
  [PROJECT_JSSY_VALUE_CONSTRUCT_COMPONENT_SAVE]:
    undoableInPreviousNode(incrementsRevision(state => {
      const topNestedConstructor = getTopNestedConstructor(state);
      const newValue = new JssyValue({
        source: 'designer',
        sourceData: new SourceDataDesigner({
          components: topNestedConstructor.components,
          rootId: topNestedConstructor.rootId,
        }),
      });
    
      return updateValue(
        closeTopNestedConstructor(state),
        topNestedConstructor.path,
        newValue,
      );
    })),
  
  [PROJECT_COMPONENT_RENAME]: undoable(incrementsRevision((state, action) => {
    const pathToCurrentComponents = getPathToCurrentComponents(state);
    const path = [].concat(pathToCurrentComponents, [
      action.componentId,
      'title',
    ]);
  
    return state.setIn(path, action.newTitle);
  })),
  
  [PROJECT_COMPONENT_TOGGLE_REGION]: undoable(incrementsRevision(
    (state, action) => {
      const pathToCurrentComponents = getPathToCurrentComponents(state);
      const path = [
        ...pathToCurrentComponents,
        action.componentId,
        'regionsEnabled',
      ];
    
      return state.updateIn(path, regionsEnabled => action.enable
        ? regionsEnabled.add(action.regionIdx)
        : regionsEnabled.delete(action.regionIdx),
      );
    },
  )),
  
  [PREVIEW_HIGHLIGHT_COMPONENT]: (state, action) =>
    updateDesigner(state, designer =>
      designer.highlightComponent(action.componentId)),
  
  [PREVIEW_UNHIGHLIGHT_COMPONENT]: (state, action) =>
    updateDesigner(state, designer =>
      designer.unhighlightComponent(action.componentId)),
  
  [PREVIEW_SELECT_COMPONENT]: (state, action) => {
    state = state.set('showAllComponentsOnPalette', false);
    
    return updateDesigner(state, action.exclusive
      ? designer => designer.selectComponentExclusive(action.componentId)
      : designer => designer.selectComponent(action.componentId),
    );
  },
  
  [PREVIEW_DESELECT_COMPONENT]: (state, action) => {
    state = state.set('showAllComponentsOnPalette', false);
    
    return updateDesigner(state, designer =>
      designer.deselectComponent(action.componentId));
  },
  
  [PREVIEW_TOGGLE_COMPONENT_SELECTION]: (state, action) => {
    state = state.set('showAllComponentsOnPalette', false);
  
    return updateDesigner(state, designer =>
      designer.toggleComponentSelection(action.componentId));
  },
  
  [PREVIEW_START_DRAG_NEW_COMPONENT]: (state, action) => {
    if (state.selectingComponentLayout || state.pickingComponent) return state;
    
    state = updateDesigner(state, designer =>
      designer.unhighlightAllComponents());
  
    return state.merge({
      draggingComponent: true,
      draggedComponentId: INVALID_ID,
      draggedComponents: action.components,
      highlightingEnabled: false,
    });
  },
  
  [PREVIEW_START_DRAG_EXISTING_COMPONENT]: (state, action) => {
    if (state.selectingComponentLayout || state.pickingComponent) return state;
  
    const pathToCurrentComponents = getPathToCurrentComponents(state);
    const currentComponents = state.getIn(pathToCurrentComponents);
    
    state = updateDesigner(state, designer =>
      designer.unhighlightAllComponents());
  
    return state.merge({
      draggingComponent: true,
      draggedComponentId: action.componentId,
      draggedComponents: currentComponents,
      highlightingEnabled: false,
    });
  },
  
  [PREVIEW_DROP_COMPONENT]: state => {
    if (!state.draggingComponent) return state;
    if (!state.draggingOverPlaceholder) return initDNDState(state);
  
    if (state.draggedComponentId !== INVALID_ID) {
      // We're dragging an existing component
      state = updateHistory(state, getPathToCurrentHistoryNode);
      
      state = moveComponent(
        state,
        state.draggedComponentId,
        state.placeholderContainerId,
        state.placeholderAfter,
      );
      
      state = incrementRevision(state);
    
      return initDNDState(state);
    } else {
      // We're dragging a new component from palette
      const rootComponent = state.draggedComponents.get(0);
      const componentMeta = getComponentMeta(rootComponent.name, state.meta);
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
        state = updateHistory(state, getPathToCurrentHistoryNode);
        state = insertDraggedComponents(state, state.draggedComponents);
        state = incrementRevision(state);
        return initDNDState(state);
      }
    }
  },
  
  [PROJECT_SELECT_LAYOUT_FOR_NEW_COMPONENT]: undoable(incrementsRevision(
    (state, action) => {
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
  )),
  
  [PROJECT_CREATE_FUNCTION]: undoable(incrementsRevision((state, action) => {
    const newFunction = new ProjectFunction({
      title: action.title,
      description: action.description,
      args: List(action.args.map(
        ({ name, type }) => new ProjectFunctionArgument({
          name,
          typedef: { type },
        }),
      )),
      
      returnType: { type: action.returnType },
      body: action.code,
      fn: createJSFunction(action.args.map(arg => arg.name), action.code),
    });
    
    return state.setIn(['data', 'functions', action.name], newFunction);
  })),
  
  [PROJECT_PICK_COMPONENT]: (state, action) => {
    if (state.pickingComponent || state.pickingComponentData) {
      return state;
    }

    state = updateDesigner(state, designer =>
      designer.unhighlightAllComponents());
    
    return state.merge({
      pickingComponent: true,
      pickingComponentData: !!action.pickData,
      pickingComponentFilter: action.filter,
      pickingComponentDataGetter: action.dataGetter,
      pickedComponentId: INVALID_ID,
    });
  },
  
  [PROJECT_PICK_COMPONENT_DONE]: (state, action) => {
    const updates = {
      pickingComponent: false,
      pickedComponentId: action.componentId,
      pickedComponentArea: action.pickArea,
    };

    if (state.pickingComponentData) {
      updates.componentDataListIsVisible = true;
      updates.componentDataListItems =
        state.pickingComponentDataGetter(action.componentId);
    }

    return state.merge(updates);
  },
  
  [PROJECT_PICK_COMPONENT_CANCEL]: state => state.merge({
    pickingComponent: false,
    pickingComponentData: false,
    pickingComponentFilter: null,
    pickingComponentDataGetter: null,
    pickedComponentId: INVALID_ID,
    pickedComponentArea: ComponentPickAreas.UNKNOWN,
    pickedComponentData: null,
    componentDataListIsVisible: false,
    componentDataListItems: [],
  }),

  [PROJECT_PICK_COMPONENT_DATA]: (state, action) => state.merge({
    pickingComponent: false,
    pickingComponentData: false,
    pickingComponentFilter: null,
    pickingComponentDataGetter: null,
    pickedComponentData: action.data,
    componentDataListIsVisible: false,
    componentDataListItems: [],
  }),
  
  [PROJECT_PICK_COMPONENT_DATA_CANCEL]: state => state.merge({
    pickingComponent: true,
    pickedComponentId: INVALID_ID,
    pickedComponentArea: ComponentPickAreas.UNKNOWN,
    componentDataListIsVisible: false,
    componentDataListItems: [],
  }),
  
  [PREVIEW_DRAG_OVER_PLACEHOLDER]: (state, action) => state.merge({
    draggingOverPlaceholder: true,
    placeholderContainerId: action.containerId,
    placeholderAfter: action.afterIdx,
  }),

  [PREVIEW_DRAG_OVER_NOTHING]: state => state.merge({
    draggingOverPlaceholder: false,
    placeholderContainerId: INVALID_ID,
    placeholderAfter: -1,
  }),
  
  [PROJECT_UNDO]: incrementsRevision(
    state => initComponentPickingState(initDNDState(state.updateIn(
      getPathToCurrentHistoryNode(state),
      record => record.moveBack(),
    ))),
  ),
  
  [PROJECT_REDO]: incrementsRevision(
    state => initComponentPickingState(initDNDState(state.updateIn(
      getPathToCurrentHistoryNode(state),
      record => record.moveForward(),
    ))),
  ),

  [PROJECT_MOVE_CURSOR]: (state, action) =>
    updateDesigner(state, designer => designer.setCursorPosition(
      action.containerId,
      action.afterIdx,
    )),
  
  [STRUCTURE_SELECT_ROUTE]: (state, action) => state.merge({
    selectedRouteId: action.routeId,
    indexRouteSelected: action.indexRouteSelected,
  }),
  
  [APP_LOAD_STRINGS_SUCCESS]: (state, action) =>
    state.set('languageForComponentProps', action.language),
  
  [LIBRARY_SHOW_ALL_COMPONENTS]: state =>
    state.set('showAllComponentsOnPalette', true),

  [DESIGN_TREE_EXPAND_ITEM]: (state, action) =>
    updateDesigner(state, designer => isArrayOrList(action.componentId)
      ? designer.expandTreeItems(action.componentId)
      : designer.expandTreeItem(action.componentId),
    ),

  [DESIGN_TREE_COLLAPSE_ITEM]: (state, action) =>
    updateDesigner(state, designer => isArrayOrList(action.componentId)
      ? designer.collapseTreeItems(action.componentId)
      : designer.collapseTreeItem(action.componentId),
    ),
};

export default (state = new ProjectState(), action) =>
  handlers[action.type] ? handlers[action.type](state, action) : state;
