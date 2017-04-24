/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { graphql, withApollo } from 'react-apollo';
import _forOwn from 'lodash.forown';
import _mapValues from 'lodash.mapvalues';
import _get from 'lodash.get';
import _set from 'lodash.set';
import { Map as ImmutableMap } from 'immutable';
import { resolveTypedef, TypeNames } from '@jssy/types';
import { getComponentById } from '../../../../models/Project';

import {
  walkComponentsTree,
  walkSimpleValues,
} from '../../../../models/ProjectComponent';

import jssyConstants from '../../../../constants/jssyConstants';
import { ContentPlaceholder } from '../components/ContentPlaceholder';
import { Outlet } from '../components/Outlet';
import { getComponentByName } from '../componentsLibrary';
import isPseudoComponent from '../isPseudoComponent';

import {
  currentSelectedComponentIdsSelector,
  currentHighlightedComponentIdsSelector,
} from '../../../../selectors';

import {
  NO_VALUE,
  SYSTEM_PROPS,
  ROUTE_PARAM_VALUE_DEF,
} from '../../../../constants/misc';

import {
  isContainerComponent,
  isCompositeComponent,
  canInsertComponent,
  getComponentMeta,
} from '../../../../utils/meta';

import {
  buildQueryForComponent,
  extractPropValueFromData,
  buildMutation,
} from '../../../../utils/graphql';

import { getJssyTypeOfField, getMutationField } from '../../../../utils/schema';
import { getFunctionInfo } from '../../../../utils/functions';
import { noop, returnNull, isString, isUndef } from '../../../../utils/misc';

const propTypes = {
  params: PropTypes.object, // Comes from react-router in non-interactive mode
  client: PropTypes.object, // Comes from react-apollo
  interactive: PropTypes.bool,
  components: PropTypes.object, // Immutable.Map<number, Component>
  rootId: PropTypes.number,
  dontPatch: PropTypes.bool,
  enclosingComponentId: PropTypes.number,
  isPlaceholder: PropTypes.bool,
  afterIdx: PropTypes.number,
  containerId: PropTypes.number,
  propsFromOwner: PropTypes.object,
  theMap: PropTypes.object,
  dataContextInfo: PropTypes.object,
  ignoreOwnerProps: PropTypes.bool,
  project: PropTypes.any.isRequired,
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object.isRequired,
  draggingComponent: PropTypes.bool.isRequired,
  draggedComponentId: PropTypes.number.isRequired,
  draggedComponents: PropTypes.any,
  draggingOverPlaceholder: PropTypes.bool.isRequired,
  placeholderContainerId: PropTypes.number.isRequired,
  placeholderAfter: PropTypes.number.isRequired,
  showContentPlaceholders: PropTypes.bool.isRequired,
  selectedComponentIds: PropTypes.object.isRequired, // Immutable.Set<number>
  highlightedComponentIds: PropTypes.object.isRequired, // Immutable.Set<number>
  onNavigate: PropTypes.func,
  onOpenURL: PropTypes.func,
};

const defaultProps = {
  params: null,
  client: null,
  interactive: false,
  components: null,
  rootId: -1,
  dontPatch: false,
  enclosingComponentId: -1,
  isPlaceholder: false,
  afterIdx: -1,
  containerId: -1,
  propsFromOwner: {},
  theMap: null,
  dataContextInfo: null,
  ignoreOwnerProps: false,
  draggedComponents: null,
  onNavigate: noop,
  onOpenURL: noop,
};

const mapStateToProps = state => ({
  project: state.project.data,
  meta: state.project.meta,
  schema: state.project.schema,
  draggingComponent: state.project.draggingComponent,
  draggedComponentId: state.project.draggedComponentId,
  draggedComponents: state.project.draggedComponents,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  showContentPlaceholders: state.app.showContentPlaceholders,
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
});

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @return {string}
 */
const serializePropAddress = (componentId, propName, isSystemProp) =>
  `${isSystemProp ? '_' : ''}.${componentId}.${propName}`;

class BuilderComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._renderHints = this._getRenderHints(props.components, props.rootId);
    this._refs = new Map();
  
    this.state = {
      dynamicPropValues: ImmutableMap(),
      componentsState: this._getInitialComponentsState(
        props.components,
        this._renderHints,
      ),
    };
  }
  
  componentWillReceiveProps(nextProps) {
    if (
      nextProps.components !== this.props.components ||
      nextProps.rootId !== this.props.rootId
    ) {
      this._renderHints = this._getRenderHints(
        nextProps.components,
        nextProps.rootId,
      );
      
      // TODO: Merge current state with initial
      
      this.setState({
        componentsState: this._getInitialComponentsState(
          nextProps.components,
          this._renderHints,
        ),
      });
    }
  }
  
  _getRenderHints(components, rootId) {
    const { meta, project, schema } = this.props;
    
    const ret = {
      needRefs: new Set(),
      activeStateSlots: new Map(),
    };
    
    if (rootId === -1) return ret;
    
    const visitAction = action => {
      if (action.type === 'method') {
        ret.needRefs.add(action.params.componentId);
      } else if (action.type === 'mutation') {
        action.params.successActions.forEach(visitAction);
        action.params.errorActions.forEach(visitAction);
      }
    };
    
    const visitValue = jssyValue => {
      if (jssyValue.source === 'actions') {
        jssyValue.sourceData.actions.forEach(visitAction);
      } else if (jssyValue.source === 'state') {
        let activeStateSlotsForComponent =
          ret.activeStateSlots.get(jssyValue.sourceData.componentId);
    
        if (!activeStateSlotsForComponent) {
          activeStateSlotsForComponent = new Set();
          ret.activeStateSlots.set(
            jssyValue.sourceData.componentId,
            activeStateSlotsForComponent,
          );
        }
    
        activeStateSlotsForComponent.add(jssyValue.sourceData.stateSlot);
      }
    };
    
    const walkSimpleValuesOptions = {
      project,
      schema,
      walkSystemProps: true,
      walkFunctionArgs: true,
      walkActions: true,
      visitIntermediateNodes: true,
    };
  
    walkComponentsTree(components, rootId, component => {
      const componentMeta = getComponentMeta(component.name, meta);
      
      walkSimpleValues(
        component,
        componentMeta,
        visitValue,
        walkSimpleValuesOptions,
      );
    });
    
    return ret;
  }
  
  _buildInitialComponentState(component, activeStateSlots) {
    const { meta } = this.props;
    
    const componentMeta = getComponentMeta(component.name, meta);
    const ret = {};
    
    activeStateSlots.forEach(stateSlotName => {
      const stateSlot = componentMeta.state[stateSlotName];
      if (!stateSlot) return;
      
      const initialValue = stateSlot.initialValue;
      
      if (initialValue.source === 'const') {
        ret[stateSlotName] = initialValue.sourceData.value;
      } else if (initialValue.source === 'prop') {
        const propValue = component.props.get(initialValue.sourceData.propName);
        const propMeta = componentMeta.props[initialValue.sourceData.propName];
        const value = this._buildValue(
          propValue,
          propMeta,
          componentMeta.types,
        );
        
        if (value !== NO_VALUE)
          ret[stateSlotName] = value;
      }
    });
    
    return ret;
  }
  
  _getInitialComponentsState(components, renderHints) {
    let componentsState = ImmutableMap();
    
    renderHints.activeStateSlots.forEach((slotNames, componentId) => {
      const component = components.get(componentId);
      const values = this._buildInitialComponentState(
        component,
        Array.from(slotNames),
      );
      
      const componentState = ImmutableMap().withMutations(map => {
        _forOwn(values, (value, slotName) => void map.set(slotName, value));
      });
      
      componentsState = componentsState.set(
        componentId,
        componentState,
      );
    });
    
    return componentsState;
  }
  
  _saveComponentRef(componentId, ref) {
    this._refs.set(componentId, ref);
  }
  
  _handleMutationResponse(mutationName, response) {
    const { project, interactive } = this.props;
    
    if (project.auth) {
      if (project.auth.type === 'jwt') {
        if (mutationName === project.auth.loginMutation) {
          if (!interactive) {
            const tokenPath = [mutationName, ...project.auth.tokenPath];
            const token = _get(response.data, tokenPath);
            if (token) localStorage.setItem('jssy_auth_token', token);
          }
        }
      }
    }
  }
  
  _performMutation(mutationName, mutation, variables) {
    const { client } = this.props;
    
    return client.mutate({ mutation, variables })
      .then(response => {
        this._handleMutationResponse(mutationName, response);
      });
  }
  
  _performAction(action, componentId, theMap, data) {
    const {
      project,
      meta,
      schema,
      components,
      onNavigate,
      onOpenURL,
    } = this.props;
    
    const { dynamicPropValues } = this.state;
    
    switch (action.type) {
      case 'mutation': {
        let selections = null;
        if (
          project.auth &&
          project.auth.type === 'jwt' &&
          action.params.mutation === project.auth.loginMutation
        )
          selections = _set({}, project.auth.tokenPath, true);
        
        const mutation = buildMutation(
          schema,
          action.params.mutation,
          selections,
        );
        
        if (!mutation) break;
      
        const mutationField = getMutationField(schema, action.params.mutation);
        const variables = {};
      
        action.params.args.forEach((argValue, argName) => {
          const mutationArg = mutationField.args[argName];
          const argJssyType = getJssyTypeOfField(mutationArg, schema);
          const value = this._buildValue(
            argValue,
            argJssyType,
            null,
            theMap,
            componentId,
            data,
          );
        
          if (value !== NO_VALUE) variables[argName] = value;
        });
        
        this._performMutation(action.params.mutation, mutation, variables)
          .then(() => {
            action.params.successActions.forEach(successAction => {
              this._performAction(successAction, componentId, theMap, data);
            });
          })
          .catch(() => {
            action.params.errorActions.forEach(errorAction => {
              this._performAction(errorAction, componentId, theMap, data);
            });
          });
      
        break;
      }
    
      case 'navigate': {
        const routeParams = {};
      
        action.params.routeParams.forEach((paramValue, paramName) => {
          const value = this._buildValue(
            paramValue,
            ROUTE_PARAM_VALUE_DEF,
            null,
            theMap,
            componentId,
            data,
          );
        
          if (value !== NO_VALUE) routeParams[paramName] = value;
        });
      
        onNavigate({ routeId: action.params.routeId, routeParams });
        break;
      }
    
      case 'url': {
        onOpenURL({
          url: action.params.url,
          newWindow: action.params.newWindow,
        });
        break;
      }
    
      case 'method': {
        const component = components.get(action.params.componentId);
        const componentInstance = this._refs.get(action.params.componentId);
        if (!component || !componentInstance) break;
        
        const componentMeta = getComponentMeta(component.name, meta);
        const isInvalidMethod =
          !componentMeta.methods ||
          !componentMeta.methods[action.params.method];
        
        if (isInvalidMethod) break;
        
        const args = [];
      
        action.params.args.forEach((argValue, idx) => {
          const argTypedef = resolveTypedef(
            componentMeta.methods[action.params.method].args[idx],
            componentMeta.types,
          );
        
          const value = this._buildValue(
            argValue,
            argTypedef,
            componentMeta.types,
            theMap,
            componentId,
            data,
          );
        
          args.push(value !== NO_VALUE ? value : void 0);
        });
      
        componentInstance[action.params.method](...args);
      
        break;
      }
    
      case 'prop': {
        let propName;
        let isSystemProp;
      
        if (action.params.propName) {
          propName = action.params.propName;
          isSystemProp = false;
        } else {
          propName = action.params.systemPropName;
          isSystemProp = true;
        }
      
        const propAddress = serializePropAddress(
          action.params.componentId,
          propName,
          isSystemProp,
        );
      
        this.setState({
          dynamicPropValues: dynamicPropValues.set(
            propAddress,
            action.params.value,
          ),
        });
      
        break;
      }
      
      case 'logout': {
        localStorage.removeItem('jssy_auth_token');
        break;
      }
    
      default:
    }
  }
  
  _buildStaticValue(
    jssyValue,
    typedef,
    userTypedefs,
    theMap,
    componentId,
    data,
  ) {
    const { propsFromOwner, ignoreOwnerProps } = this.props;
    
    const resolvedTypedef = resolveTypedef(typedef, userTypedefs);
    
    if (jssyValue.sourceData.ownerPropName && !ignoreOwnerProps) {
      return propsFromOwner[jssyValue.sourceData.ownerPropName];
    } else if (resolvedTypedef.type === TypeNames.SHAPE) {
      if (jssyValue.sourceData.value === null) return null;
    
      const ret = {};
    
      _forOwn(resolvedTypedef.fields, (fieldMeta, fieldName) => {
        const fieldValue = jssyValue.sourceData.value.get(fieldName);
      
        if (!isUndef(fieldValue)) {
          ret[fieldName] = this._buildValue(
            fieldValue,
            fieldMeta,
            userTypedefs,
            theMap,
            componentId,
            data,
          );
        }
      });
    
      return ret;
    } else if (resolvedTypedef.type === TypeNames.OBJECT_OF) {
      if (jssyValue.sourceData.value === null) return null;
    
      return jssyValue.sourceData.value.map(nestedValue =>
        this._buildValue(
          nestedValue,
          resolvedTypedef.ofType,
          userTypedefs,
          theMap,
          componentId,
          data,
        ),
      ).toJS();
    } else if (resolvedTypedef.type === TypeNames.ARRAY_OF) {
      return jssyValue.sourceData.value.map(nestedValue =>
        this._buildValue(
          nestedValue,
          resolvedTypedef.ofType,
          userTypedefs,
          theMap,
          componentId,
          data,
        ),
      ).toJS();
    } else {
      return jssyValue.sourceData.value;
    }
  }
  
  _buildConstValue(jssyValue) {
    return jssyValue.sourceData.jssyConstId
      ? jssyConstants[jssyValue.sourceData.jssyConstId]
      : jssyValue.sourceData.value;
  }
  
  _buildDesignerValue(jssyValue, theMap) {
    const { params, interactive, onNavigate, onOpenURL } = this.props;
    
    if (!jssyValue.hasDesignedComponent()) return returnNull;
  
    return props => (
      <Builder
        params={params}
        interactive={interactive}
        components={jssyValue.sourceData.components}
        rootId={jssyValue.sourceData.rootId}
        dontPatch
        propsFromOwner={props}
        theMap={theMap}
        dataContextInfo={theMap.get(jssyValue)}
        onNavigate={onNavigate}
        onOpenURL={onOpenURL}
      >
        {props.children}
      </Builder>
    );
  }
  
  _buildDataValue(jssyValue, data) {
    const { schema, propsFromOwner, dataContextInfo } = this.props;
    
    if (jssyValue.sourceData.queryPath !== null) {
      if (jssyValue.sourceData.dataContext.size > 0 && dataContextInfo) {
        const ourDataContextInfo =
          dataContextInfo[jssyValue.sourceData.dataContext.last()];
      
        const data = propsFromOwner[ourDataContextInfo.ownerPropName];
      
        return extractPropValueFromData(
          jssyValue,
          data,
          schema,
          ourDataContextInfo.type,
        );
      } else if (data) {
        return extractPropValueFromData(jssyValue, data, schema);
      }
    }
    
    return NO_VALUE;
  }
  
  _buildFunctionValue(jssyValue, userTypedefs, theMap, componentId, data) {
    const { project } = this.props;
    
    const fnInfo = getFunctionInfo(
      jssyValue.sourceData.functionSource,
      jssyValue.sourceData.function,
      project,
    );
  
    if (!fnInfo) return NO_VALUE;
  
    const argValues = fnInfo.args.map(argInfo => {
      const argValue = jssyValue.sourceData.args.get(argInfo.name);
    
      let ret = NO_VALUE;
    
      if (argValue) {
        ret = this._buildValue(
          argValue,
          argInfo.typedef,
          userTypedefs,
          theMap,
          componentId,
          data,
        );
      }
    
      if (ret === NO_VALUE) ret = argInfo.defaultValue;
      return ret;
    });
  
    // TODO: Pass fns as last argument
    return fnInfo.fn(...argValues, {});
  }
  
  _buildActionsValue(
    jssyValue,
    typedef,
    userTypedefs,
    theMap,
    componentId,
    data,
  ) {
    const { interactive, isPlaceholder } = this.props;
    const { componentsState } = this.state;
  
    if (isPlaceholder) return noop;
  
    const resolvedTypedef = resolveTypedef(typedef, userTypedefs);
  
    return (...args) => {
      const stateUpdates = resolvedTypedef.sourceConfigs.actions.updateState;
    
      if (stateUpdates) {
        const currentState = componentsState.get(componentId);
      
        if (currentState) {
          let nextState = currentState;
        
          _forOwn(stateUpdates, (value, slotName) => {
            if (!currentState.has(slotName)) return;
          
            let newValue = NO_VALUE;
            if (value.source === 'const') {
              newValue = value.sourceData.value;
            } else if (value.source === 'arg') {
              newValue = _get(
                args[value.sourceData.arg],
                value.sourceData.path,
                NO_VALUE,
              );
            }
          
            if (newValue !== NO_VALUE)
              nextState = nextState.set(slotName, newValue);
          });
        
          if (nextState !== currentState) {
            this.setState({
              componentsState: componentsState.set(componentId, nextState),
            });
          }
        }
      }
    
      // No actions in design-time
      if (interactive) return;
    
      jssyValue.sourceData.actions.forEach(action => {
        this._performAction(action, componentId, theMap, data);
      });
    };
  }
  
  _buildStateValue(jssyValue) {
    const { componentsState } = this.state;
    
    const componentState =
      componentsState.get(jssyValue.sourceData.componentId);
  
    const haveValue =
      !!componentState &&
      componentState.has(jssyValue.sourceData.stateSlot);
  
    return haveValue
      ? componentState.get(jssyValue.sourceData.stateSlot)
      : NO_VALUE;
  }
  
  _buildRouteParamsValue(jssyValue) {
    const {
      params,
      interactive,
      project,
    } = this.props;
    
    if (interactive) {
      const route = project.routes.get(jssyValue.sourceData.routeId);
      return route
        ? route.paramValues.get(jssyValue.sourceData.paramName)
        : NO_VALUE;
    } else {
      return params[jssyValue.sourceData.paramName];
    }
  }

  /**
   *
   * @param {Object} jssyValue
   * @param {JssyTypeDefinition} typedef
   * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
   * @param {?Immutable.Map<Object, Object>} [theMap=null]
   * @param {?number} [componentId=null]
   * @param {?Object} [data=null]
   * @return {*}
   */
  _buildValue(
    jssyValue,
    typedef,
    userTypedefs = null, // Required if the typedef references custom types
    theMap = null, // Required to build values with 'designer' source
    componentId = null, // Required to build values with 'actions' source
    data = null, // Required to build values with 'data' source and no dataContext
  ) {
    if (jssyValue.source === 'static') {
      return this._buildStaticValue(
        jssyValue,
        typedef,
        userTypedefs,
        theMap,
        componentId,
        data,
      );
    } else if (jssyValue.source === 'const') {
      return this._buildConstValue(jssyValue);
    } else if (jssyValue.source === 'designer') {
      if (theMap === null) {
        throw new Error(
          'Builder#_buildDesignerValue(): ' +
          'Got value with "designer" source, but theMap is null',
        );
      }
      
      return this._buildDesignerValue(jssyValue, theMap);
    } else if (jssyValue.source === 'data') {
      return this._buildDataValue(jssyValue, data);
    } else if (jssyValue.source === 'function') {
      return this._buildFunctionValue(
        jssyValue,
        userTypedefs,
        theMap,
        componentId,
        data,
      );
    } else if (jssyValue.source === 'actions') {
      if (componentId === null) {
        throw new Error(
          'Builder#_buildValue(): ' +
          'Got value with "actions" source, but componentId is null',
        );
      }
      
      return this._buildActionsValue(
        jssyValue,
        typedef,
        userTypedefs,
        theMap,
        componentId,
        data,
      );
    } else if (jssyValue.source === 'state') {
      return this._buildStateValue(jssyValue);
    } else if (jssyValue.source === 'routeParams') {
      return this._buildRouteParamsValue(jssyValue);
    }

    throw new Error(
      `Builder#_buildValue: Unknown value source: "${jssyValue.source}"`,
    );
  }

  /**
   * Constructs props object
   *
   * @param {Object} component
   * @param {Immutable.Map<Object, Object>} theMap
   * @param {?Object} [data=null]
   * @return {Object<string, *>}
   */
  _buildProps(component, theMap, data = null) {
    const { meta } = this.props;
    const { dynamicPropValues } = this.state;
    const componentMeta = getComponentMeta(component.name, meta);
    const ret = {};

    component.props.forEach((propValue, propName) => {
      const propMeta = componentMeta.props[propName];
      const propAddress = serializePropAddress(component.id, propName, false);
      const dynamicPropValue = dynamicPropValues.get(propAddress);
      const value = this._buildValue(
        dynamicPropValue || propValue,
        propMeta,
        componentMeta.types,
        theMap,
        component.id,
        data,
      );

      if (value !== NO_VALUE) ret[propName] = value;
    });

    return ret;
  }
  
  _buildSystemProps(component, theMap) {
    const { dynamicPropValues } = this.state;
    const ret = {};
    
    component.systemProps.forEach((propValue, propName) => {
      const propMeta = SYSTEM_PROPS[propName];
      const propAddress = serializePropAddress(component.id, propName, true);
      const dynamicPropValue = dynamicPropValues.get(propAddress);
      const value = this._buildValue(
        dynamicPropValue || propValue,
        propMeta,
        null,
        theMap,
        component.id,
      );
  
      if (value !== NO_VALUE) ret[propName] = value;
    });
    
    return ret;
  }
  
  /**
   *
   * @param {Object} component
   * @param {boolean} [isPlaceholderRoot=false]
   * @return {ReactElement}
   * @private
   */
  _renderOutletComponent(component, isPlaceholderRoot = false) {
    const { isPlaceholder } = this.props;
    
    const props = {};
    if (isPlaceholder) {
      if (isPlaceholderRoot) this._patchPlaceholderRootProps(props, false);
    } else {
      this._patchComponentProps(props, false, component.id);
    }
    
    return (
      <Outlet {...props} />
    );
  }

  /**
   *
   * @param {Object} component
   * @param {boolean} [isPlaceholderRoot=false]
   * @return {*}
   * @private
   */
  _renderPseudoComponent(component, isPlaceholderRoot = false) {
    const { interactive, isPlaceholder } = this.props;
    
    const systemProps = this._buildSystemProps(component, null);
    if (!systemProps.visible) return null;
    
    const props = this._buildProps(component, null);
    
    if (component.name === 'Outlet') {
      if (isPlaceholder || (interactive && !this.props.children))
        return this._renderOutletComponent(component, isPlaceholderRoot);
      else
        return this.props.children;
    } else if (component.name === 'Text') {
      return props.text || '';
    } else if (component.name === 'List') {
      const ItemComponent = props.component;
      return props.data.map((item, idx) => (
        <ItemComponent key={String(idx)} item={item} />
      ));
    } else {
      return null;
    }
  }
  
  /**
   *
   * @param {number} containerId
   * @return {Object}
   * @private
   */
  _getContainerComponent(containerId) {
    if (containerId > -1) {
      return this.props.components.get(containerId);
    } else if (this.props.enclosingComponentId > -1) {
      return getComponentById(
        this.props.project,
        this.props.enclosingComponentId,
      );
    } else {
      return null;
    }
  }

  /**
   *
   * @param {number} containerId
   * @param {number} afterIdx
   * @return {ReactElement}
   * @private
   */
  _renderPlaceholderForDraggedComponent(containerId, afterIdx) {
    const {
      draggedComponents,
      draggedComponentId,
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
    } = this.props;

    const collapsed =
      !draggingOverPlaceholder ||
      placeholderContainerId !== containerId ||
      placeholderAfter !== afterIdx;

    if (collapsed) {
      return (
        <div
          style={{ width: '0', height: '0', margin: '0' }}
          data-jssy-placeholder=""
          data-jssy-container-id={String(containerId)}
          data-jssy-after={String(afterIdx)}
        />
      );
    }

    const rootDraggedComponentId = draggedComponentId > -1
      ? draggedComponentId
      : 0;

    const key = `placeholder-${containerId}:${afterIdx}`;

    return (
      <Builder
        key={key}
        components={draggedComponents}
        rootId={rootDraggedComponentId}
        isPlaceholder
        afterIdx={afterIdx}
        containerId={containerId}
      />
    );
  }

  _getRootDraggedComponent() {
    const {
      draggingComponent,
      draggedComponents,
      draggedComponentId,
    } = this.props;

    if (!draggingComponent) return null;

    const rootDraggedComponentId = draggedComponentId > -1
      ? draggedComponentId
      : 0;

    return draggedComponents.get(rootDraggedComponentId);
  }

  /**
   *
   * @param {ProjectComponent} component
   * @param {boolean} [isPlaceholder=false]
   * @return {?ReactElement[]}
   * @private
   */
  _renderComponentChildren(component, isPlaceholder = false) {
    const { meta, components, draggingComponent } = this.props;

    const ret = [];
    const isComposite = isCompositeComponent(component.name, meta);
    const rootDraggedComponent = this._getRootDraggedComponent();
    const childNames =
      component.children.map(childId => components.get(childId).name);

    const willRenderPlaceholders =
      draggingComponent &&
      !isPlaceholder &&
      !isComposite;

    if (component.children.size === 0 && !willRenderPlaceholders)
      return null;

    component.children.forEach((childComponentId, idx) => {
      const childComponent = components.get(childComponentId);

      // Do not render disabled regions in composite components
      if (!isPlaceholder && isComposite && !component.regionsEnabled.has(idx))
        return;

      if (willRenderPlaceholders) {
        const canInsertHere = canInsertComponent(
          rootDraggedComponent.name,
          component.name,
          childNames,
          idx,
          meta,
        );

        if (canInsertHere) {
          ret.push(this._renderPlaceholderForDraggedComponent(
            component.id,
            idx - 1,
          ));
        }
      }

      ret.push(this._renderComponent(childComponent, isPlaceholder));
    });

    if (willRenderPlaceholders) {
      const canInsertHere = canInsertComponent(
        rootDraggedComponent.name,
        component.name,
        childNames,
        component.children.length,
        meta,
      );

      if (canInsertHere) {
        ret.push(this._renderPlaceholderForDraggedComponent(
          component.id,
          component.children.size - 1,
        ));
      }
    }

    return ret;
  }

  /**
   *
   * @param {Object} props
   * @param {boolean} isHTMLComponent
   * @param {number} componentId
   * @private
   */
  _patchComponentProps(props, isHTMLComponent, componentId) {
    if (isHTMLComponent) props['data-jssy-id'] = componentId;
    else props.__jssy_component_id__ = componentId;
  }

  /**
   *
   * @param {Object} props
   * @param {boolean} isHTMLComponent
   * @private
   */
  _patchPlaceholderRootProps(props, isHTMLComponent) {
    if (isHTMLComponent) {
      props['data-jssy-placeholder'] = '';
      props['data-jssy-after'] = this.props.afterIdx;
      props['data-jssy-container-id'] = this.props.containerId;
    } else {
      props.__jssy_placeholder__ = true;
      props.__jssy_after__ = this.props.afterIdx;
      props.__jssy_container_id__ = this.props.containerId;
    }
  }

  _willRenderContentPlaceholder(component) {
    if (!this.props.interactive) return false;
    
    return isContainerComponent(component.name, this.props.meta) && (
      this.props.showContentPlaceholders ||
      this.props.highlightedComponentIds.has(component.id) ||
      this.props.selectedComponentIds.has(component.id)
    );
  }

  /**
   *
   * @param {Object} component
   * @param {boolean} [isPlaceholder=false]
   * @param {boolean} [isPlaceholderRoot=false]
   * @return {ReactElement}
   * @private
   */
  _renderComponent(
    component,
    isPlaceholder = false,
    isPlaceholderRoot = false,
  ) {
    // Do not render the component that's being dragged
    if (component.id === this.props.draggedComponentId && !isPlaceholder)
      return null;

    // Handle special components like Text, Outlet etc.
    if (isPseudoComponent(component))
      return this._renderPseudoComponent(component, isPlaceholderRoot);

    // Get component class
    const Component = getComponentByName(component.name);
    const isHTMLComponent = isString(Component);

    // Build GraphQL query
    const {
      query: graphQLQuery,
      variables: graphQLVariables,
      theMap,
    } = buildQueryForComponent(
      component,
      this.props.schema,
      this.props.meta,
      this.props.project,
    );
    
    const theMergedMap = this.props.theMap
      ? this.props.theMap.merge(theMap)
      : theMap;
  
    // Build system props
    const systemProps = this._buildSystemProps(component, theMergedMap);
    
    if (!systemProps.visible) return null;
    
    // Build props
    const props = graphQLQuery
      ? {} // We'll build them later
      : this._buildProps(component, theMergedMap);

    // Render children
    props.children = this._renderComponentChildren(component, isPlaceholder);

    if (!isPlaceholder) {
      props.key = component.id;
      
      if (this._renderHints.needRefs.has(component.id))
        props.ref = this._saveComponentRef.bind(this, component.id);

      if (this.props.interactive && !this.props.dontPatch)
        this._patchComponentProps(props, isHTMLComponent, component.id);

      if (!props.children && this._willRenderContentPlaceholder(component)) {
        props.children = (
          <ContentPlaceholder />
        );
      }
    } else {
      // TODO: Get rid of random keys
      props.key =
        `placeholder-${String(Math.floor(Math.random() * 1000000000))}`;

      if (isPlaceholderRoot && !this.props.dontPatch)
        this._patchPlaceholderRootProps(props, isHTMLComponent);

      const willRenderContentPlaceholder =
        !props.children &&
        isContainerComponent(component.name, this.props.meta);

      // Render fake content inside placeholders for container components
      if (willRenderContentPlaceholder) {
        props.children = (
          <ContentPlaceholder />
        );
      }
    }
    
    let Renderable = Component;

    if (graphQLQuery) {
      const variables = _mapValues(
        graphQLVariables,
        
        ({ argDefinition, argValue }) => this._buildValue(
          argValue,
          getJssyTypeOfField(argDefinition, this.props.schema),
        ),
      );
      
      Renderable = graphql(graphQLQuery, {
        props: ({ ownProps, data }) => {
          // TODO: Better check
          const haveData = Object.keys(data).length > 10;

          return {
            ...ownProps,
            ...this._buildProps(
              component,
              theMergedMap,
              haveData ? data : null,
            ),
          };
        },

        options: {
          variables,
          forceFetch: true,
          notifyOnNetworkStatusChange: true,
        },
      })(Renderable);
    }
  
    //noinspection JSValidateTypes
    return (
      <Renderable {...props} />
    );
  }

  render() {
    const {
      components,
      rootId,
      isPlaceholder,
      draggingComponent,
    } = this.props;
    
    if (rootId > -1) {
      const rootComponent = components.get(rootId);
      return this._renderComponent(rootComponent, isPlaceholder, isPlaceholder);
    } else if (draggingComponent && !isPlaceholder) {
      return this._renderPlaceholderForDraggedComponent(-1, -1);
    } else {
      return null;
    }
  }
}

BuilderComponent.propTypes = propTypes;
BuilderComponent.defaultProps = defaultProps;
BuilderComponent.displayName = 'Builder';

const Builder = connect(mapStateToProps)(withApollo(BuilderComponent));
export default Builder;
