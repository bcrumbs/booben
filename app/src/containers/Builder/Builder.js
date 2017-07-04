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
import _debounce from 'lodash.debounce';
import { Map as ImmutableMap } from 'immutable';
import { resolveTypedef, coerceValue, TypeNames } from '@jssy/types';
import { alertsCreator } from '../../hocs/alerts';
import { wrapComponent as draggable } from '../../hocs/draggable';
import { connectDraggable } from '../ComponentsDragArea/ComponentsDragArea';
import { ContentPlaceholder } from './ContentPlaceholder/ContentPlaceholder';
import { Outlet } from './Outlet/Outlet';
import JssyValue from '../../models/JssyValue';
import ProjectComponent from '../../models/ProjectComponent';
import { startDragExistingComponent } from '../../actions/preview';

import {
  selectedComponentIdsSelector,
  highlightedComponentIdsSelector,
  rootDraggedComponentSelector,
  getLocalizedTextFromState,
} from '../../selectors/index';

import collapsingToPoint from '../../hocs/collapsingToPoint';

import {
  isContainerComponent,
  isCompositeComponent,
  getComponentMeta,
} from '../../lib/meta';

import {
  canInsertComponent,
  canInsertRootComponent,
  walkComponentsTree,
  walkSimpleValues,
} from '../../lib/components';

import {
  buildQueryForComponent,
  extractPropValueFromData,
  buildMutation,
} from '../../lib/graphql';

import {
  getJssyValueDefOfQueryArgument,
  getJssyValueDefOfMutationArgument,
  getJssyValueDefOfField,
  getMutationField,
  getFieldByPath,
} from '../../lib/schema';

import { getComponentByName } from '../../lib/react-components';
import { getFunctionInfo } from '../../lib/functions';
import { noop, returnNull, isUndef } from '../../utils/misc';
import * as JssyPropTypes from '../../constants/common-prop-types';

import {
  INVALID_ID,
  NO_VALUE,
  SYSTEM_PROPS,
  ROUTE_PARAM_VALUE_DEF,
  AJAX_BODY_VALUE_DEF,
  AJAX_URL_VALUE_DEF,
} from '../../constants/misc';

import { DND_DRAG_START_RADIUS_CANVAS } from '../../config';

const propTypes = {
  params: PropTypes.object,
  interactive: PropTypes.bool,
  editable: PropTypes.bool,
  components: JssyPropTypes.components.isRequired,
  rootId: PropTypes.number,
  enclosingComponents: JssyPropTypes.components,
  enclosingContainerId: PropTypes.number,
  enclosingAfterIdx: PropTypes.number,
  dontPatch: PropTypes.bool,
  isPlaceholder: PropTypes.bool,
  afterIdx: PropTypes.number,
  containerId: PropTypes.number,
  propsFromOwner: PropTypes.object,
  theMap: PropTypes.object,
  dataContextInfo: PropTypes.object,
  ignoreOwnerProps: PropTypes.bool,
  client: PropTypes.object, // react-apollo
  project: PropTypes.any.isRequired, // state
  meta: PropTypes.object.isRequired, // state
  schema: PropTypes.object.isRequired, // state
  draggingComponent: PropTypes.bool.isRequired, // state
  rootDraggedComponent: PropTypes.instanceOf(ProjectComponent), // state
  draggedComponents: JssyPropTypes.components, // state
  draggingOverPlaceholder: PropTypes.bool.isRequired, // state
  placeholderContainerId: PropTypes.number.isRequired, // state
  placeholderAfter: PropTypes.number.isRequired, // state
  showContentPlaceholders: PropTypes.bool.isRequired, // state
  selectedComponentIds: JssyPropTypes.setOfIds.isRequired, // state
  highlightedComponentIds: JssyPropTypes.setOfIds.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onNavigate: PropTypes.func,
  onOpenURL: PropTypes.func,
  onAlert: PropTypes.func.isRequired, // alertsCreator
  onStartDragComponent: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
  params: null,
  client: null,
  interactive: false,
  editable: false,
  components: null,
  rootId: INVALID_ID,
  enclosingComponents: null,
  enclosingContainerId: INVALID_ID,
  enclosingAfterIdx: -1,
  dontPatch: false,
  isPlaceholder: false,
  afterIdx: -1,
  containerId: INVALID_ID,
  propsFromOwner: {},
  theMap: null,
  dataContextInfo: null,
  ignoreOwnerProps: false,
  draggedComponents: null,
  rootDraggedComponent: null,
  onNavigate: noop,
  onOpenURL: noop,
};

const contextTypes = {
  window: PropTypes.object,
};

const mapStateToProps = state => ({
  project: state.project.data,
  meta: state.project.meta,
  schema: state.project.schema,
  draggingComponent: state.project.draggingComponent,
  rootDraggedComponent: rootDraggedComponentSelector(state),
  draggedComponents: state.project.draggedComponents,
  draggingOverPlaceholder: state.project.draggingOverPlaceholder,
  placeholderContainerId: state.project.placeholderContainerId,
  placeholderAfter: state.project.placeholderAfter,
  showContentPlaceholders: state.app.showContentPlaceholders,
  selectedComponentIds: selectedComponentIdsSelector(state),
  highlightedComponentIds: highlightedComponentIdsSelector(state),
  getLocalizedText: getLocalizedTextFromState(state),
});

const mapDispatchToProps = dispatch => ({
  onStartDragComponent: componentId =>
    void dispatch(startDragExistingComponent(componentId)),
});

const wrap = compose(
  connect(mapStateToProps, mapDispatchToProps),
  withApollo,
  alertsCreator,
  collapsingToPoint({
    pointAttributesFromProps: props => ({
      'data-jssy-placeholder': '',
      'data-jssy-container-id': String(props.containerId),
      'data-jssy-after': String(props.afterIdx),
    }),
    
    getWindowInstance: (props, context) => context.window,
  }),
);

/**
 *
 * @type {Set<string>}
 * @const
 */
const pseudoComponents = new Set([
  'Text',
  'Outlet',
  'List',
]);

/**
 *
 * @param {ProjectComponent} component
 * @return {boolean}
 */
const isPseudoComponent = component => pseudoComponents.has(component.name);

/**
 *
 * @param {number} componentId
 * @param {string} propName
 * @param {boolean} isSystemProp
 * @return {string}
 */
const serializePropAddress = (componentId, propName, isSystemProp) =>
  `${isSystemProp ? '_' : ''}.${componentId}.${propName}`;

/**
 *
 * @type {Map}
 */
const connectedComponentsCache = new Map();

/**
 *
 * @param {string} componentName
 * @return {Function}
 */
const getConnectedComponent = componentName => {
  const cached = connectedComponentsCache.get(componentName);
  if (cached) return cached;
  const ret = connectDraggable(draggable(getComponentByName(componentName)));
  connectedComponentsCache.set(componentName, ret);
  return ret;
};

class BuilderComponent extends PureComponent {
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
    
    this._handleComponentDragStart = this._handleComponentDragStart.bind(this);
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
  
  _handleErrorInComponentLifecycleHook(component, error, hookName) {
    const { interactive, getLocalizedText, onAlert } = this.props;
    
    if (!interactive) return;
    
    const message = getLocalizedText('alert.componentError', {
      componentName: component.title
        ? `${component.title} (${component.name})`
        : component.name,
      
      hookName,
      message: error.message,
    });
    
    const alert = {
      content: message,
    };
    
    onAlert(alert);
  }
  
  /**
   *
   * @param {Object} data
   * @param {number} data.componentId
   * @private
   */
  _handleComponentDragStart({ data }) {
    const { onStartDragComponent } = this.props;
    onStartDragComponent(data.componentId);
  }

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
  
  _getApolloWrappedComponentFromCache(component) {
    const cached = this._apolloWrappedComponentsCache.get(component.id);
  
    return cached && cached.component === component
      ? cached.wrapper
      : null;
  }
  
  _putApolloWrappedComponentToCache(component, wrapper) {
    this._apolloWrappedComponentsCache.set(component.id, {
      component,
      wrapper,
    });
  }
  
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
        
        if (value !== NO_VALUE) {
          ret[stateSlotName] = value;
        }
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
  
  async _performMutationAction(
    action,
    componentId,
    theMap,
    data,
    actionArgValues,
    actionValueDef,
    actionUserTypedefs,
    ajaxRequestResult,
  ) {
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
    
      const value = this._buildValue(
        argValue,
        argJssyType,
        null,
        theMap,
        componentId,
        data,
        actionArgValues,
        actionValueDef,
        actionUserTypedefs,
        ajaxRequestResult,
      );
    
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
        this._performAction(
          successAction,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          ajaxRequestResult,
        );
      });
    } catch (error) {
      action.params.errorActions.forEach(errorAction => {
        this._performAction(
          errorAction,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          ajaxRequestResult,
        );
      });
    }
  }
  
  _performNavigateAction(
    action,
    componentId,
    theMap,
    data,
    actionArgValues,
    actionValueDef,
    actionUserTypedefs,
    ajaxRequestResult,
  ) {
    const { onNavigate } = this.props;
    
    const routeParams = {};
  
    action.params.routeParams.forEach((paramValue, paramName) => {
      const value = this._buildValue(
        paramValue,
        ROUTE_PARAM_VALUE_DEF,
        null,
        theMap,
        componentId,
        data,
        actionArgValues,
        actionValueDef,
        actionUserTypedefs,
        ajaxRequestResult,
      );
    
      if (value !== NO_VALUE) routeParams[paramName] = value;
    });
  
    onNavigate({ routeId: action.params.routeId, routeParams });
  }
  
  _performURLAction(action) {
    const { onOpenURL } = this.props;
    
    onOpenURL({
      url: action.params.url,
      newWindow: action.params.newWindow,
    });
  }
  
  _performMethodAction(
    action,
    componentId,
    theMap,
    data,
    actionArgValues,
    actionValueDef,
    actionUserTypedefs,
    ajaxRequestResult,
  ) {
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
    
      const value = this._buildValue(
        argValue,
        argTypedef,
        componentMeta.types,
        theMap,
        componentId,
        data,
        actionArgValues,
        actionValueDef,
        actionUserTypedefs,
        ajaxRequestResult,
      );
    
      args.push(value !== NO_VALUE ? value : void 0);
    });
  
    componentInstance[action.params.method](...args);
  }
  
  _performPropAction(
    action,
    componentId,
    theMap,
    data,
    actionArgValues,
    actionValueDef,
    actionUserTypedefs,
    ajaxRequestResult,
  ) {
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
    
      newValue = JssyValue.staticFromJS(this._buildValue(
        action.params.value,
        targetPropMeta,
        targetComponent.types,
        theMap,
        componentId,
        data,
        actionArgValues,
        actionValueDef,
        actionUserTypedefs,
        ajaxRequestResult,
      ));
    } else {
      newValue = action.params.value;
    }
  
    this.setState({
      dynamicPropValues: dynamicPropValues.set(propAddress, newValue),
    });
  }
  
  _performLogoutAction() {
    localStorage.removeItem('jssy_auth_token');
  }
  
  async _performAJAXAction(
    action,
    componentId,
    theMap,
    data,
    actionArgValues,
    actionValueDef,
    actionUserTypedefs,
    ajaxRequestResult,
  ) {
    const url = this._buildValue(
      action.params.url,
      AJAX_URL_VALUE_DEF,
      null,
      theMap,
      componentId,
      data,
      actionArgValues,
      actionValueDef,
      actionUserTypedefs,
      ajaxRequestResult,
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
      const bodyValue = this._buildValue(
        action.params.body,
        AJAX_BODY_VALUE_DEF,
        null,
        theMap,
        componentId,
        data,
        actionArgValues,
        actionValueDef,
        actionUserTypedefs,
        ajaxRequestResult,
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
      
      const result = {
        error: null,
        status: response.status,
        headers: response.headers,
        body,
      };
  
      action.params.successActions.forEach(successAction => {
        this._performAction(
          successAction,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          result,
        );
      });
    } catch (error) {
      const result = {
        error,
        status: null,
        headers: null,
        body: null,
      };
      
      action.params.errorActions.forEach(errorAction => {
        this._performAction(
          errorAction,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          result,
        );
      });
    }
  }
  
  _performAction(
    action,
    componentId,
    theMap,
    data,
    actionArgValues,
    actionValueDef,
    actionUserTypedefs,
    ajaxRequestResult,
  ) {
    switch (action.type) {
      case 'mutation': {
        this._performMutationAction(
          action,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          ajaxRequestResult,
        );
        
        break;
      }
    
      case 'navigate': {
        this._performNavigateAction(
          action,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          ajaxRequestResult,
        );
        
        break;
      }
    
      case 'url': {
        this._performURLAction(action);
        break;
      }
    
      case 'method': {
        this._performMethodAction(
          action,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          ajaxRequestResult,
        );
        
        break;
      }
    
      case 'prop': {
        this._performPropAction(
          action,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          ajaxRequestResult,
        );
      
        break;
      }
      
      case 'logout': {
        this._performLogoutAction();
        break;
      }
      
      case 'ajax': {
        this._performAJAXAction(
          action,
          componentId,
          theMap,
          data,
          actionArgValues,
          actionValueDef,
          actionUserTypedefs,
          ajaxRequestResult,
        );
        
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
    return jssyValue.sourceData.value;
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
  
  _buildDataValue(jssyValue, valueDef, userTypedefs, data) {
    const { schema, propsFromOwner, dataContextInfo } = this.props;
    
    if (jssyValue.sourceData.queryPath !== null) {
      const path = jssyValue.sourceData.queryPath
        .map(step => step.field)
        .toJS();
      
      if (jssyValue.sourceData.dataContext.size > 0) {
        if (dataContextInfo) {
          const ourDataContextInfo =
            dataContextInfo[jssyValue.sourceData.dataContext.last()];
  
          const data = propsFromOwner[ourDataContextInfo.ownerPropName];
          const rawValue = extractPropValueFromData(
            jssyValue,
            data,
            schema,
            ourDataContextInfo.type,
          );
  
          const field = getFieldByPath(schema, path, ourDataContextInfo.type);
          const fieldValueDef = getJssyValueDefOfField(field, schema);
  
          return coerceValue(
            rawValue,
            fieldValueDef,
            valueDef,
            null,
            userTypedefs,
          );
        }
      } else if (data) {
        const rawValue = extractPropValueFromData(jssyValue, data, schema);
        const field = getFieldByPath(schema, path);
        const fieldValueDef = getJssyValueDefOfField(field, schema);
        
        return coerceValue(
          rawValue,
          fieldValueDef,
          valueDef,
          null,
          userTypedefs,
        );
      }
    }
    
    return NO_VALUE;
  }
  
  _buildFunctionValue(
    jssyValue,
    valueDef,
    userTypedefs,
    theMap,
    componentId,
    data,
  ) {
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
    const rawValue = fnInfo.fn(...argValues, {});
    
    return coerceValue(
      rawValue,
      fnInfo.returnType,
      valueDef,
      null,
      userTypedefs,
    );
  }
  
  _buildActionsValue(
    jssyValue,
    valueDef,
    userTypedefs,
    theMap,
    componentId,
    data,
    ajaxRequestResult,
  ) {
    const { interactive, isPlaceholder } = this.props;
    const { componentsState } = this.state;
  
    if (isPlaceholder) return noop;
  
    const resolvedTypedef = resolveTypedef(valueDef, userTypedefs);
  
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
    
      // No actions in design-time
      if (interactive) return;
    
      jssyValue.sourceData.actions.forEach(action => {
        this._performAction(
          action,
          componentId,
          theMap,
          data,
          args,
          valueDef,
          userTypedefs,
          ajaxRequestResult,
        );
      });
    };
  }
  
  _buildStateValue(jssyValue, valueDef, userTypedefs) {
    const { meta, components } = this.props;
    const { componentsState } = this.state;
    
    const componentState =
      componentsState.get(jssyValue.sourceData.componentId);
  
    const haveValue =
      !!componentState &&
      componentState.has(jssyValue.sourceData.stateSlot);
    
    if (!haveValue) return NO_VALUE;
  
    const rawValue = componentState.get(jssyValue.sourceData.stateSlot);
    const sourceComponent = components.get(jssyValue.sourceData.componentId);
    const sourceComponentMeta = getComponentMeta(sourceComponent.name, meta);
    const stateSlotMeta =
      sourceComponentMeta.state[jssyValue.sourceData.stateSlot];
    
    return coerceValue(
      rawValue,
      stateSlotMeta,
      valueDef,
      sourceComponentMeta.types,
      userTypedefs,
    );
  }
  
  _buildRouteParamsValue(jssyValue, valueDef, userTypedefs) {
    const {
      params,
      interactive,
      project,
    } = this.props;
    
    let rawValue = NO_VALUE;
    if (interactive) {
      const route = project.routes.get(jssyValue.sourceData.routeId);
      if (route) {
        rawValue = route.paramValues.get(jssyValue.sourceData.paramName);
      }
    } else {
      rawValue = params[jssyValue.sourceData.paramName];
    }
    
    if (rawValue === NO_VALUE) return NO_VALUE;
    
    return coerceValue(
      rawValue,
      ROUTE_PARAM_VALUE_DEF,
      valueDef,
      null,
      userTypedefs,
    );
  }
  
  _buildActionArgValue(
    jssyValue,
    valueDef,
    userTypedefs,
    actionArgValues,
    actionValueDef,
    actionUserTypedefs,
  ) {
    const argIdx = jssyValue.sourceData.arg;
    
    return coerceValue(
      actionArgValues[argIdx],
      actionValueDef.sourceConfigs.actions.args[argIdx],
      valueDef,
      actionUserTypedefs,
      userTypedefs,
    );
  }
  
  /**
   * @typedef {Object} AJAXRequestResult
   * @property {?Error} error
   * @property {number} status
   * @property {Object<string, string>} headers
   * @property {*} body
   */

  /**
   *
   * @param {Object} jssyValue
   * @param {JssyTypeDefinition} valueDef
   * @param {?Object<string, JssyTypeDefinition>} [userTypedefs=null]
   * @param {?Immutable.Map<Object, Object>} [theMap=null]
   * @param {?number} [componentId=null]
   * @param {?Object} [data=null]
   * @param {?(*[])} [actionArgValues=null]
   * @param {?JssyValueDefinition} [actionValueDef=null]
   * @param {?Object<string, JssyTypeDefinition>} [actionUserTypedefs=null]
   * @param {?AJAXRequestResult} [ajaxRequestResult=null]
   * @return {*}
   */
  _buildValue(
    jssyValue,
    valueDef,
    userTypedefs = null, // Required if the valueDef references custom types
    theMap = null, // Required to build values with 'designer' source
    componentId = null, // Required to build values with 'actions' source
    data = null, // Required to build values with 'data' source and no dataContext
    actionArgValues = null, // Required to build values with 'actionArg' source and no dataContext
    actionValueDef = null, // Required to build values with 'actionArg' source and no dataContext
    actionUserTypedefs = null, // Required to build values with 'actionArg' source and no dataContext
    ajaxRequestResult = null,
  ) {
    if (jssyValue.source === 'static') {
      return this._buildStaticValue(
        jssyValue,
        valueDef,
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
      return this._buildDataValue(jssyValue, valueDef, userTypedefs, data);
    } else if (jssyValue.source === 'function') {
      return this._buildFunctionValue(
        jssyValue,
        valueDef,
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
        valueDef,
        userTypedefs,
        theMap,
        componentId,
        data,
        ajaxRequestResult,
      );
    } else if (jssyValue.source === 'state') {
      return this._buildStateValue(jssyValue, valueDef, userTypedefs);
    } else if (jssyValue.source === 'routeParams') {
      return this._buildRouteParamsValue(jssyValue, valueDef, userTypedefs);
    } else if (jssyValue.source === 'actionArg') {
      return this._buildActionArgValue(
        jssyValue,
        valueDef,
        userTypedefs,
        actionArgValues,
        actionValueDef,
        actionUserTypedefs,
      );
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
    const { interactive, isPlaceholder, children } = this.props;
    
    const systemProps = this._buildSystemProps(component, null);
    if (!systemProps.visible) return null;
    
    const props = this._buildProps(component, null);
    
    if (component.name === 'Outlet') {
      if (isPlaceholder || (interactive && !children)) {
        return this._renderOutletComponent(component, isPlaceholderRoot);
      } else {
        return children;
      }
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
   * @param {number} containerId
   * @param {number} afterIdx
   * @return {ReactElement}
   * @private
   */
  _renderPlaceholderForDraggedComponent(containerId, afterIdx) {
    const {
      rootDraggedComponent,
      draggedComponents,
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
    } = this.props;
  
    const key = `placeholder-${containerId}:${afterIdx}`;

    const collapsed =
      !draggingOverPlaceholder ||
      placeholderContainerId !== containerId ||
      placeholderAfter !== afterIdx;
  
    return (
      <Builder
        key={key}
        components={draggedComponents}
        rootId={rootDraggedComponent.id}
        isPlaceholder
        collapsedToPoint={collapsed}
        containerId={containerId}
        afterIdx={afterIdx}
      />
    );
  }

  /**
   *
   * @param {ProjectComponent} component
   * @param {boolean} [isPlaceholder=false]
   * @return {?ReactElement[]}
   * @private
   */
  _renderComponentChildren(component, isPlaceholder = false) {
    const {
      meta,
      components,
      editable,
      draggingComponent,
      rootDraggedComponent,
    } = this.props;

    const ret = [];
    const isComposite = isCompositeComponent(component.name, meta);

    const willRenderPlaceholders =
      editable &&
      draggingComponent &&
      !isPlaceholder &&
      !isComposite;

    if (component.children.size === 0 && !willRenderPlaceholders) {
      return null;
    }

    component.children.forEach((childComponentId, idx) => {
      const childComponent = components.get(childComponentId);
  
      // Do not render the component that's being dragged
      if (
        draggingComponent &&
        !rootDraggedComponent.isNew &&
        childComponent.id === rootDraggedComponent.id
      ) {
        return;
      }

      // Do not render disabled regions in composite components
      if (!isPlaceholder && isComposite && !component.regionsEnabled.has(idx)) {
        return;
      }

      if (willRenderPlaceholders) {
        const canInsertHere = canInsertComponent(
          rootDraggedComponent.name,
          components,
          component.id,
          idx - 1,
          meta,
        );

        if (canInsertHere) {
          ret.push(this._renderPlaceholderForDraggedComponent(
            component.id,
            idx - 1,
          ));
        }
      }

      const rendered = this._renderComponent(
        childComponent,
        component,
        isPlaceholder,
      );
      if (Array.isArray(rendered)) ret.push(...rendered);
      else ret.push(rendered);
    });

    if (willRenderPlaceholders) {
      const canInsertHere = canInsertComponent(
        rootDraggedComponent.name,
        components,
        component.id,
        component.children.size - 1,
        meta,
      );

      if (canInsertHere) {
        ret.push(this._renderPlaceholderForDraggedComponent(
          component.id,
          component.children.size - 1,
        ));
      }
    }

    return ret.length > 0 ? ret : null;
  }

  /**
   *
   * @param {Object} props
   * @param {number} componentId
   * @private
   */
  _patchComponentProps(props, componentId) {
    props.__jssy_component_id__ = componentId;
  }

  /**
   *
   * @param {Object} props
   * @private
   */
  _patchPlaceholderRootProps(props) {
    const { containerId, afterIdx } = this.props;
  
    props.__jssy_placeholder__ = true;
    props.__jssy_after__ = afterIdx;
    props.__jssy_container_id__ = containerId;
  }

  _willRenderContentPlaceholder(component) {
    const {
      meta,
      interactive,
      showContentPlaceholders,
      highlightedComponentIds,
      selectedComponentIds,
    } = this.props;
    
    if (!interactive) return false;
    
    return isContainerComponent(component.name, meta) && (
      showContentPlaceholders ||
      highlightedComponentIds.has(component.id) ||
      selectedComponentIds.has(component.id)
    );
  }

  /**
   *
   * @param {Object} component
   * @param {Object} [parentComponent=null]
   * @param {boolean} [isPlaceholder=false]
   * @param {boolean} [isPlaceholderRoot=false]
   * @return {ReactElement}
   * @private
   */
  _renderComponent(
    component,
    parentComponent = null,
    isPlaceholder = false,
    isPlaceholderRoot = false,
  ) {
    const {
      meta,
      schema,
      interactive,
      editable,
      dontPatch,
      theMap: thePreviousMap,
      getLocalizedText,
      onAlert,
    } = this.props;

    // Handle special components like Text, Outlet etc
    if (isPseudoComponent(component)) {
      return this._renderPseudoComponent(component, isPlaceholderRoot);
    }

    // Get component class
    const Component = getConnectedComponent(component.name);

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
    props.children = this._renderComponentChildren(component, isPlaceholder);
    
    // Attach error handler
    props.__jssy_error_handler__ = _debounce(
      this._handleErrorInComponentLifecycleHook.bind(this, component),
      250,
    );
  
    if (isPlaceholder) {
      // TODO: Get rid of random keys
      props.key =
        `placeholder-${String(Math.floor(Math.random() * 1000000000))}`;
  
      if (isPlaceholderRoot && !dontPatch) {
        this._patchPlaceholderRootProps(props);
      }
  
      const willRenderContentPlaceholder =
        !props.children &&
        isContainerComponent(component.name, meta);
  
      // Render fake content inside placeholders for container components
      if (willRenderContentPlaceholder) {
        props.children = (
          <ContentPlaceholder />
        );
      }
    } else {
      props.key = String(component.id);
  
      if (this._renderHints.needRefs.has(component.id)) {
        props.ref = this._saveComponentRef.bind(this, component.id);
      }
  
      if (interactive && !dontPatch) {
        this._patchComponentProps(props, component.id);
      }
  
      if (!props.children && this._willRenderContentPlaceholder(component)) {
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
          getJssyValueDefOfQueryArgument(argDefinition, schema),
        ),
      );
  
      Renderable = this._getApolloWrappedComponentFromCache(component);
      
      if (!Renderable) {
        Renderable = graphql(graphQLQuery, {
          props: ({ ownProps, data }) => {
            if (data.error) {
              const message = getLocalizedText('alert.queryError', {
                message: data.error.message,
              });
              
              const alert = {
                content: message,
              };
              
              onAlert(alert);
            }
            
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
            fetchPolicy: 'cache-and-network',
          },
        })(Renderable);
        
        this._putApolloWrappedComponentToCache(component, Renderable);
      }
    }
  
    const isDraggable =
      editable &&
      parentComponent !== null &&
      !isCompositeComponent(parentComponent.name, meta);
    
    return (
      <Renderable
        key={props.key}
        innerProps={props}
        dragEnable={isDraggable}
        dragTitle={component.title || component.name}
        dragData={{ componentId: component.id }}
        dragStartRadius={DND_DRAG_START_RADIUS_CANVAS}
        onDragStart={this._handleComponentDragStart}
      />
    );
  }

  render() {
    const {
      meta,
      editable,
      components,
      rootId,
      enclosingComponents,
      enclosingContainerId,
      enclosingAfterIdx,
      isPlaceholder,
      draggingComponent,
      rootDraggedComponent,
    } = this.props;
    
    if (rootId !== INVALID_ID) {
      const rootComponent = components.get(rootId);
      return this._renderComponent(
        rootComponent,
        null,
        isPlaceholder,
        isPlaceholder,
      );
    } else if (editable && draggingComponent && !isPlaceholder) {
      const canInsertDraggedComponentAsRoot =
        enclosingComponents !== null && enclosingContainerId !== INVALID_ID
          ? canInsertComponent(
            rootDraggedComponent.name,
            enclosingComponents,
            enclosingContainerId,
            enclosingAfterIdx,
            meta,
          )
          : canInsertRootComponent(
            rootDraggedComponent.name,
            meta,
          );
  
      return canInsertDraggedComponentAsRoot
        ? this._renderPlaceholderForDraggedComponent(INVALID_ID, -1)
        : null;
    } else {
      return null;
    }
  }
}

BuilderComponent.propTypes = propTypes;
BuilderComponent.defaultProps = defaultProps;
BuilderComponent.contextTypes = contextTypes;
BuilderComponent.displayName = 'Builder';

export const Builder = wrap(BuilderComponent);
