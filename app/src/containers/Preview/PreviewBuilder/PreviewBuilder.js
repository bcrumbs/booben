/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { graphql, withApollo } from 'react-apollo';
import _forOwn from 'lodash.forown';
import _mapValues from 'lodash.mapvalues';
import _get from 'lodash.get';
import _set from 'lodash.set';
import { Map as ImmutableMap } from 'immutable';
import { resolveTypedef } from '@jssy/types';
import JssyValue from '../../../models/JssyValue';
import { isCompositeComponent, getComponentMeta } from '../../../lib/meta';
import { walkComponentsTree, walkSimpleValues } from '../../../lib/components';
import { buildQueryForComponent, buildMutation } from '../../../lib/graphql';

import {
  getJssyValueDefOfQueryArgument,
  getJssyValueDefOfMutationArgument,
  getMutationField,
} from '../../../lib/schema';

import { buildValue } from '../../../lib/values';
import { getComponentByName } from '../../../lib/react-components';
import { noop } from '../../../utils/misc';
import * as JssyPropTypes from '../../../constants/common-prop-types';

import {
  INVALID_ID,
  NO_VALUE,
  SYSTEM_PROPS,
  ROUTE_PARAM_VALUE_DEF,
  AJAX_BODY_VALUE_DEF,
  AJAX_URL_VALUE_DEF,
} from '../../../constants/misc';

const propTypes = {
  components: JssyPropTypes.components.isRequired,
  rootId: PropTypes.number,
  routeParams: PropTypes.object,
  propsFromOwner: PropTypes.object,
  theMap: PropTypes.object,
  dataContextInfo: PropTypes.object,
  client: PropTypes.object, // react-apollo
  project: PropTypes.any.isRequired, // state
  meta: PropTypes.object.isRequired, // state
  schema: PropTypes.object, // state
  onNavigate: PropTypes.func,
  onOpenURL: PropTypes.func,
};

const defaultProps = {
  client: null,
  schema: null,
  components: null,
  rootId: INVALID_ID,
  routeParams: {},
  propsFromOwner: {},
  theMap: null,
  dataContextInfo: null,
  onNavigate: noop,
  onOpenURL: noop,
};

const mapStateToProps = state => ({
  project: state.project.data,
  meta: state.project.meta,
  schema: state.project.schema,
});

const wrap = compose(
  connect(mapStateToProps),
  withApollo,
);

/**
 *
 * @type {Set<string>}
 * @const
 */
const PSEUDO_COMPONENTS = new Set(['Text', 'Outlet', 'List']);

/**
 *
 * @param {ProjectComponent} component
 * @return {boolean}
 */
const isPseudoComponent = component => PSEUDO_COMPONENTS.has(component.name);

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @return {string}
 */
const serializePropAddress = (componentId, propName, isSystemProp) =>
  `${isSystemProp ? '_' : ''}.${componentId}.${propName}`;

class PreviewBuilderComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._renderHints = this._getRenderHints(props.components, props.rootId);
    this._refs = new Map();
    this._queriesCache = new Map();
    this._apolloWrappedComponentsCache = new Map();
    
    this.state = {
      dynamicPropValues: ImmutableMap(),
      componentsState: this._getInitialComponentsState(
        props.components,
        this._renderHints,
      ),
    };
  }
  
  componentWillReceiveProps(nextProps) {
    const { components, rootId } = this.props;
    const { componentsState } = this.state;
    
    const componentsUpdated =
      nextProps.components !== components ||
      nextProps.rootId !== rootId;
    
    if (componentsUpdated) {
      this._renderHints = this._getRenderHints(
        nextProps.components,
        nextProps.rootId,
      );
      
      const initialComponentsState = this._getInitialComponentsState(
        nextProps.components,
        this._renderHints,
      );
      
      const nextComponentsState = initialComponentsState.map(
        (componentState, componentId) => componentState.map(
          (value, slotName) =>
          componentsState.getIn([componentId, slotName]) || value,
        ),
      );
      
      this.setState({
        componentsState: nextComponentsState,
      });
    }
  }
  
  /**
   *
   * @param {Object} component
   * @return {ComponentQueryData}
   * @private
   */
  _getQueryForComponent(component) {
    const { schema, meta, project } = this.props;
    
    const cached = this._queriesCache.get(component.id);
    
    if (cached && cached.component === component) {
      return cached.queryData;
    }
    
    const queryData = buildQueryForComponent(component, schema, meta, project);
    this._queriesCache.set(component.id, { component, queryData });
    
    return queryData;
  }
  
  /**
   *
   * @param {Object} component
   * @return {ReactComponent}
   * @private
   */
  _getApolloWrappedComponentFromCache(component) {
    const cached = this._apolloWrappedComponentsCache.get(component.id);
    
    return cached && cached.component === component
      ? cached.wrapper
      : null;
  }
  
  /**
   *
   * @param {Object} component
   * @param {ReactComponent} wrapper
   * @private
   */
  _putApolloWrappedComponentToCache(component, wrapper) {
    this._apolloWrappedComponentsCache.set(component.id, {
      component,
      wrapper,
    });
  }
  
  /**
   * @typedef {Object} RenderHints
   * @property {Set<number>} needRefs
   * @property {Map<number, Set<string>>} activeStateSlots
   */
  
  /**
   *
   * @param {Immutable.Map<number, Object>} components
   * @param {number} rootId
   * @return {RenderHints}
   * @private
   */
  _getRenderHints(components, rootId) {
    const { meta, project, schema } = this.props;
    
    const ret = {
      needRefs: new Set(),
      activeStateSlots: new Map(),
    };
    
    if (rootId === INVALID_ID) return ret;
    
    const visitAction = action => {
      if (action.type === 'method') {
        ret.needRefs.add(action.params.componentId);
      } else if (action.type === 'mutation' || action.type === 'ajax') {
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
  
  /**
   *
   * @param {Object} component
   * @param {Array<string>} activeStateSlots
   * @return {Object<string, *>}
   * @private
   */
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
        const valueContext = this._getValueContext(component.id);
        const value = buildValue(
          propValue,
          propMeta,
          componentMeta.types,
          valueContext,
        );
        
        if (value !== NO_VALUE) {
          ret[stateSlotName] = value;
        }
      }
    });
    
    return ret;
  }
  
  /**
   *
   * @param {Immutable.Map<number, Object>} components
   * @param {RenderHints} renderHints
   * @return {Immutable.Map<number, Immutable.Map<string, *>>}
   * @private
   */
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
  
  /**
   *
   * @param {number} componentId
   * @param {*} ref
   * @private
   */
  _saveComponentRef(componentId, ref) {
    this._refs.set(componentId, ref);
  }
  
  /**
   *
   * @param {string} mutationName
   * @param {Object} response
   * @private
   */
  _handleMutationResponse(mutationName, response) {
    const { project } = this.props;
    
    if (project.auth) {
      if (project.auth.type === 'jwt') {
        if (mutationName === project.auth.loginMutation) {
          const tokenPath = [mutationName, ...project.auth.tokenPath];
          const token = _get(response.data, tokenPath);
          if (token) localStorage.setItem('jssy_auth_token', token);
        }
      }
    }
  }
  
  /**
   *
   * @param {Object} action
   * @param {ValueContext} valueContext
   * @return {Promise<void>}
   * @private
   */
  async _performMutationAction(action, valueContext) {
    const { project, schema, client } = this.props;
    
    let selections = null;
    
    if (
      project.auth &&
      project.auth.type === 'jwt' &&
      action.params.mutation === project.auth.loginMutation
    ) {
      selections = _set({}, project.auth.tokenPath, true);
    }
    
    const mutation = buildMutation(
      schema,
      action.params.mutation,
      selections,
    );
    
    if (!mutation) return;
    
    const mutationField = getMutationField(schema, action.params.mutation);
    const variables = {};
    
    action.params.args.forEach((argValue, argName) => {
      const mutationArg = mutationField.args[argName];
      const argJssyType = getJssyValueDefOfMutationArgument(
        mutationArg,
        schema,
      );
      
      const value = buildValue(argValue, argJssyType, null, valueContext);
      
      if (value !== NO_VALUE) variables[argName] = value;
    });
    
    try {
      const response = await client.mutate({ mutation, variables });
      this._handleMutationResponse(action.params.mutation, response);
      
      // We cannot know (yet) what queries need to be updated
      // based on the mutation result, so the only option we have
      // is to drop the cache and refetch everything.
      client.resetStore();
      
      action.params.successActions.forEach(successAction => {
        this._performAction(successAction, valueContext);
      });
    } catch (error) {
      action.params.errorActions.forEach(errorAction => {
        this._performAction(errorAction, valueContext);
      });
    }
  }
  
  /**
   *
   * @param {Object} action
   * @param {ValueContext} valueContext
   * @private
   */
  _performNavigateAction(action, valueContext) {
    const { onNavigate } = this.props;
    
    const routeParams = {};
    
    action.params.routeParams.forEach((paramValue, paramName) => {
      const value = buildValue(
        paramValue,
        ROUTE_PARAM_VALUE_DEF,
        null,
        valueContext,
      );
      
      if (value !== NO_VALUE) routeParams[paramName] = value;
    });
    
    onNavigate({ routeId: action.params.routeId, routeParams });
  }
  
  /**
   *
   * @param {Object} action
   * @private
   */
  _performURLAction(action) {
    const { onOpenURL } = this.props;
    
    onOpenURL({
      url: action.params.url,
      newWindow: action.params.newWindow,
    });
  }
  
  /**
   *
   * @param {Object} action
   * @param {ValueContext} valueContext
   * @private
   */
  _performMethodAction(action, valueContext) {
    const { meta, components } = this.props;
    
    const component = components.get(action.params.componentId);
    const componentInstance = this._refs.get(action.params.componentId);
    if (!component || !componentInstance) return;
    
    const componentMeta = getComponentMeta(component.name, meta);
    const isInvalidMethod =
      !componentMeta.methods ||
      !componentMeta.methods[action.params.method];
    
    if (isInvalidMethod) return;
    
    const args = [];
    
    action.params.args.forEach((argValue, idx) => {
      const argTypedef = resolveTypedef(
        componentMeta.methods[action.params.method].args[idx],
        componentMeta.types,
      );
      
      const value = buildValue(
        argValue,
        argTypedef,
        componentMeta.types,
        valueContext,
      );
      
      args.push(value !== NO_VALUE ? value : void 0);
    });
    
    componentInstance[action.params.method](...args);
  }
  
  /**
   *
   * @param {Object} action
   * @param {ValueContext} valueContext
   * @private
   */
  _performPropAction(action, valueContext) {
    const { meta, components } = this.props;
    const { dynamicPropValues } = this.state;
    
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
    
    let newValue;
    if (action.params.value.sourceIs('actionArg')) {
      const targetComponent = components.get(action.params.componentId);
      const targetComponentMeta = getComponentMeta(
        targetComponent.name,
        meta,
      );
      
      const targetPropMeta = isSystemProp
        ? SYSTEM_PROPS[propName]
        : targetComponentMeta.props[propName];
      
      newValue = JssyValue.staticFromJS(buildValue(
        action.params.value,
        targetPropMeta,
        targetComponent.types,
        valueContext,
      ));
    } else {
      newValue = action.params.value;
    }
    
    this.setState({
      dynamicPropValues: dynamicPropValues.set(propAddress, newValue),
    });
  }
  
  /**
   *
   * @private
   */
  _performLogoutAction() {
    localStorage.removeItem('jssy_auth_token');
  }
  
  /**
   *
   * @param {Object} action
   * @param {ValueContext} valueContext
   * @return {Promise<void>}
   * @private
   */
  async _performAJAXAction(action, valueContext) {
    const url = buildValue(
      action.params.url,
      AJAX_URL_VALUE_DEF,
      null,
      valueContext,
    );
    
    if (url === NO_VALUE) return;
    
    const requestInit = {
      method: action.params.method,
      headers: action.params.headers.toJS(),
      mode: action.params.mode,
    };
    
    const willAddBody =
      action.params.body !== null &&
      action.params.method !== 'GET' &&
      action.params.method !== 'HEAD';
    
    if (willAddBody) {
      const bodyValue = buildValue(
        action.params.body,
        AJAX_BODY_VALUE_DEF,
        null,
        valueContext,
      );
      
      if (bodyValue !== NO_VALUE) {
        requestInit.body = JSON.stringify(bodyValue);
      }
    }
    
    try {
      const response = await fetch(url, requestInit);
      
      let body = null;
      if (action.params.decodeResponse === 'text') {
        body = await response.text();
      } else if (action.params.decodeResponse === 'blob') {
        body = await response.blob();
      } else if (action.params.decodeResponse === 'json') {
        body = await response.json();
      } else if (action.params.decodeResponse === 'arrayBuffer') {
        body = await response.arrayBuffer();
      }
      
      const ajaxRequestResult = {
        error: null,
        status: response.status,
        headers: response.headers,
        body,
      };
      
      const nextValueContext = { ...valueContext, ajaxRequestResult };
      
      action.params.successActions.forEach(successAction => {
        this._performAction(successAction, nextValueContext);
      });
    } catch (error) {
      const ajaxRequestResult = {
        error,
        status: null,
        headers: null,
        body: null,
      };
      
      const nextValueContext = { ...valueContext, ajaxRequestResult };
      
      action.params.errorActions.forEach(errorAction => {
        this._performAction(errorAction, nextValueContext);
      });
    }
  }
  
  /**
   *
   * @param {Object} action
   * @param {ValueContext} valueContext
   * @private
   */
  _performAction(action, valueContext) {
    switch (action.type) {
      case 'mutation': {
        this._performMutationAction(action, valueContext);
        break;
      }
      
      case 'navigate': {
        this._performNavigateAction(action, valueContext);
        break;
      }
      
      case 'url': {
        this._performURLAction(action);
        break;
      }
      
      case 'method': {
        this._performMethodAction(action, valueContext);
        break;
      }
      
      case 'prop': {
        this._performPropAction(action, valueContext);
        break;
      }
      
      case 'logout': {
        this._performLogoutAction();
        break;
      }
      
      case 'ajax': {
        this._performAJAXAction(action, valueContext);
        break;
      }
      
      default:
    }
  }
  
  /**
   *
   * @param {number} componentId
   * @param {Object} jssyValue
   * @param {JssyValueDefinition} valueDef
   * @param {Object<string, JssyTypeDefinition>} userTypedefs
   * @param {ValueContext} valueContext
   * @private
   */
  _handleActions(componentId, jssyValue, valueDef, userTypedefs, valueContext) {
    const { componentsState } = this.state;
    
    const resolvedTypedef = resolveTypedef(valueDef, userTypedefs);
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
              valueContext.actionArgValues[value.sourceData.arg],
              value.sourceData.path,
              NO_VALUE,
            );
          }
          
          if (newValue !== NO_VALUE) {
            nextState = nextState.set(slotName, newValue);
          }
        });
        
        if (nextState !== currentState) {
          this.setState({
            componentsState: componentsState.set(componentId, nextState),
          });
        }
      }
    }
    
    jssyValue.sourceData.actions.forEach(action => {
      this._performAction(action, valueContext);
    });
  }
  
  /**
   *
   * @param {number} componentId
   * @param {Immutable.Map<Object, DataContextsInfo>} [theMap=null]
   * @param {?Object} [data=null]
   * @return {ValueContext}
   * @private
   */
  _getValueContext(componentId, theMap = null, data = null) {
    const {
      meta,
      schema,
      project,
      components,
      propsFromOwner,
      dataContextInfo,
      routeParams,
      onNavigate,
      onOpenURL,
    } = this.props;
    
    const { componentsState } = this.state;
    
    return {
      meta,
      schema,
      components,
      componentsState,
      propsFromOwner,
      dataContextInfo,
      projectFunctions: project.functions,
      theMap,
      data,
      routeParams,
      BuilderComponent: PreviewBuilder, // eslint-disable-line no-use-before-define
      getBuilderProps: (ownProps, jssyValue, valueContext) => ({
        routeParams,
        components: jssyValue.sourceData.components,
        rootId: jssyValue.sourceData.rootId,
        propsFromOwner: ownProps,
        theMap: valueContext.theMap,
        dataContextInfo: valueContext.theMap.get(jssyValue),
        onNavigate,
        onOpenURL,
      }),
      
      handleActions: (jssyValue, valueDef, userTypedefs, valueContext) => {
        this._handleActions(
          componentId,
          jssyValue,
          valueDef,
          userTypedefs,
          valueContext,
        );
      },
    };
  }
  
  /**
   * Constructs props object
   *
   * @param {Object} component
   * @param {Immutable.Map<Object, DataContextsInfo>} theMap
   * @param {?Object} [data=null]
   * @return {Object<string, *>}
   */
  _buildProps(component, theMap, data = null) {
    const { meta } = this.props;
    const { dynamicPropValues } = this.state;
    
    const componentMeta = getComponentMeta(component.name, meta);
    const valueContext = this._getValueContext(component.id, theMap, data);
    const ret = {};
    
    component.props.forEach((propValue, propName) => {
      const propMeta = componentMeta.props[propName];
      const propAddress = serializePropAddress(component.id, propName, false);
      const dynamicPropValue = dynamicPropValues.get(propAddress);
      const value = buildValue(
        dynamicPropValue || propValue,
        propMeta,
        componentMeta.types,
        valueContext,
      );
      
      if (value !== NO_VALUE) ret[propName] = value;
    });
    
    return ret;
  }
  
  /**
   * Constructs system props object
   *
   * @param {Object} component
   * @param {Immutable.Map<Object, DataContextsInfo>} theMap
   * @return {Object<string, *>}
   */
  _buildSystemProps(component, theMap) {
    const { dynamicPropValues } = this.state;
    
    const valueContext = this._getValueContext(component.id, theMap);
    const ret = {};
    
    component.systemProps.forEach((propValue, propName) => {
      const propMeta = SYSTEM_PROPS[propName];
      const propAddress = serializePropAddress(component.id, propName, true);
      const dynamicPropValue = dynamicPropValues.get(propAddress);
      const value = buildValue(
        dynamicPropValue || propValue,
        propMeta,
        null,
        valueContext,
      );
      
      if (value !== NO_VALUE) ret[propName] = value;
    });
    
    return ret;
  }
  
  /**
   *
   * @param {Object} component
   * @return {*}
   * @private
   */
  _renderPseudoComponent(component) {
    const { children } = this.props;
    
    const systemProps = this._buildSystemProps(component, null);
    if (!systemProps.visible) return null;
    
    const props = this._buildProps(component, null);
    
    if (component.name === 'Outlet') {
      return children;
    } else if (component.name === 'Text') {
      return props.text || '';
    } else if (component.name === 'List') {
      const ItemComponent = props.component;
      return props.data.map((item, idx) => (
        // eslint-disable-next-line react/no-array-index-key
        <ItemComponent key={`${component.id}-${idx}`} item={item} />
      ));
    } else {
      return null;
    }
  }
  
  /**
   *
   * @param {ProjectComponent} component
   * @return {?ReactElement[]}
   * @private
   */
  _renderComponentChildren(component) {
    const { meta, components } = this.props;
    
    const ret = [];
    const isComposite = isCompositeComponent(component.name, meta);
    
    if (component.children.size === 0) {
      return null;
    }
    
    component.children.forEach((childComponentId, idx) => {
      const childComponent = components.get(childComponentId);
      
      // Do not render disabled regions in composite components
      if (isComposite && !component.regionsEnabled.has(idx)) {
        return;
      }
      
      const rendered = this._renderComponent(childComponent);
      
      if (Array.isArray(rendered)) {
        ret.push(...rendered);
      } else {
        ret.push(rendered);
      }
    });
    
    return ret.length > 0 ? ret : null;
  }
  
  /**
   *
   * @param {Object} component
   * @return {ReactElement}
   * @private
   */
  _renderComponent(component) {
    const { schema, theMap: thePreviousMap } = this.props;
    
    // Handle special components like Text, Outlet etc
    if (isPseudoComponent(component)) {
      return this._renderPseudoComponent(component);
    }
    
    // Get component class
    const Component = getComponentByName(component.name);
    
    // Build GraphQL query
    const { query: graphQLQuery, variables: graphQLVariables, theMap } =
      this._getQueryForComponent(component);
    
    const theMergedMap = thePreviousMap
      ? thePreviousMap.merge(theMap)
      : theMap;
    
    // Build system props
    const systemProps = this._buildSystemProps(component, theMergedMap);
    
    // Don't render anything if the component is invisible
    if (!systemProps.visible) return null;
    
    // Build props
    const props = graphQLQuery
      ? {} // We'll build them later
      : this._buildProps(component, theMergedMap);
    
    // Render children
    props.children = this._renderComponentChildren(component);
    props.key = String(component.id);
  
    if (this._renderHints.needRefs.has(component.id)) {
      props.ref = this._saveComponentRef.bind(this, component.id);
    }
    
    let Renderable = Component;
    
    if (graphQLQuery) {
      const valueContext = this._getValueContext(component.id);
      const buildArgValue = ({ argDefinition, argValue }) => buildValue(
        argValue,
        getJssyValueDefOfQueryArgument(argDefinition, schema),
        null,
        valueContext,
      );
      
      const variables = _mapValues(graphQLVariables, buildArgValue);
      
      Renderable = this._getApolloWrappedComponentFromCache(component);
      
      if (!Renderable) {
        Renderable = graphql(graphQLQuery, {
          props: ({ ownProps, data }) => {
            // TODO: Better check
            const haveData = Object.keys(data).length > 10;
            
            return {
              ...ownProps,
              innerProps: this._buildProps(
                component,
                theMergedMap,
                haveData ? data : null,
              ),
            };
          },
          
          options: {
            variables,
            fetchPolicy: 'cache-and-network',
          },
        })(Component);
        
        this._putApolloWrappedComponentToCache(component, Renderable);
      }
    }
    
    return (
      <Renderable {...props} />
    );
  }
  
  render() {
    const { components, rootId } = this.props;
  
    return rootId !== INVALID_ID
      ? this._renderComponent(components.get(rootId))
      : null;
  }
}

PreviewBuilderComponent.propTypes = propTypes;
PreviewBuilderComponent.defaultProps = defaultProps;
PreviewBuilderComponent.displayName = 'PreviewBuilder';

export const PreviewBuilder = wrap(PreviewBuilderComponent);
