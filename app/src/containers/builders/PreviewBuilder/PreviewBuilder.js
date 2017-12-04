/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { graphql, withApollo } from 'react-apollo';
import Immutable from 'immutable';
import forOwn from 'lodash.forown';
import get from 'lodash.get';
import set from 'lodash.set';
import pick from 'lodash.pick';
import defaultsDeep from 'lodash.defaultsdeep';
import { resolveTypedef } from '@jssy/types';

import {
  isPseudoComponent,
  getComponentByName,
  getRenderHints,
  getInitialComponentsState,
  mergeComponentsState,
} from '../helpers';

import JssyValue from '../../../models/JssyValue';

import {
  isCompositeComponent,
  getComponentMeta,
  getSourceConfig,
} from '../../../lib/meta';

import {
  buildQueryForComponent,
  buildMutation,
  getDataFieldKey,
} from '../../../lib/graphql';

import { queryResultHasData } from '../../../lib/apollo';

import {
  FieldKinds,
  getJssyValueDefOfMutationArgument,
  getMutationField,
  getFieldOnType,
  findFirstConnectionInPath,
  RELAY_PAGEINFO_FIELDS,
  RELAY_PAGEINFO_FIELD_HAS_NEXT_PAGE,
} from '../../../lib/schema';

import { walkSimpleValues } from '../../../lib/components';
import { buildValue, buildGraphQLQueryVariables } from '../../../lib/values';
import ComponentsBundle from '../../../lib/ComponentsBundle';
import { createPath, getObjectByPath } from '../../../lib/path';
import { noop, mapListToArray } from '../../../utils/misc';
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
  componentsBundle: PropTypes.instanceOf(ComponentsBundle).isRequired,
  project: PropTypes.any.isRequired,
  meta: PropTypes.object.isRequired,
  schema: PropTypes.object,
  components: JssyPropTypes.components.isRequired,
  rootId: PropTypes.number,
  routeParams: PropTypes.object,
  propsFromOwner: PropTypes.object,
  theMap: PropTypes.object,
  dataContextInfo: PropTypes.object,
  client: PropTypes.object, // react-apollo
  onNavigate: PropTypes.func,
  onOpenURL: PropTypes.func,
};

const defaultProps = {
  schema: null,
  components: null,
  rootId: INVALID_ID,
  routeParams: {},
  propsFromOwner: {},
  theMap: null,
  dataContextInfo: null,
  client: null,
  onNavigate: noop,
  onOpenURL: noop,
};

const wrap = withApollo;

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
    
    this._renderHints = getRenderHints(
      props.components,
      props.rootId,
      props.meta,
      props.schema,
      props.project,
    );

    this._refs = new Map();
    this._pageInfos = Immutable.Map();
    this._graphQLVariables = new Map();
    
    this.state = {
      dynamicPropValues: Immutable.Map(),
      componentsState: getInitialComponentsState(
        props.components,
        props.meta,
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
      this._refs = new Map();
      this._pageInfos = Immutable.Map();
      this._graphQLVariables = new Map();
      
      this._renderHints = getRenderHints(
        nextProps.components,
        nextProps.rootId,
        nextProps.meta,
        nextProps.schema,
        nextProps.project,
      );

      this.setState({
        componentsState: mergeComponentsState(
          componentsState,
          getInitialComponentsState(
            nextProps.components,
            nextProps.meta,
            this._renderHints,
          ),
        ),
      });
    }
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
          const token = get(response.data, tokenPath);
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
      selections = set({}, project.auth.tokenPath, true);
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
    
    if (action.params.componentId === INVALID_ID) return;
    
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
  
    if (action.params.componentId === INVALID_ID) return;
    
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
    if (action.params.value.sourceIs(JssyValue.Source.ACTION_ARG)) {
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
   * @return {Promise<void>}
   * @private
   */
  async _performLoadMoreDataAction(action, valueContext) {
    const { schema, components } = this.props;
  
    if (action.params.componentId === INVALID_ID) return;
  
    const component = components.get(action.params.componentId);
    const componentInstance = this._refs.get(action.params.componentId);
    if (!component || !componentInstance) return;
    
    const observableQuery = componentInstance.queryObservable;
    if (!observableQuery) return;
  
    const pathToDataValue = createPath(
      component,
      action.params.pathToDataValue.toJS(),
    );
  
    const dataValue = getObjectByPath(pathToDataValue);
    
    // TODO: Handle values with data context
    if (dataValue.sourceData.dataContext.size > 0) return;
    
    const queryPath = mapListToArray(
      dataValue.sourceData.queryPath,
      step => step.field,
    );
    
    const connectionIdx = findFirstConnectionInPath(schema, queryPath);
    if (connectionIdx === -1) return;
    
    const edgesPath = [
      ...queryPath
        .slice(0, connectionIdx + 1)
        .map(field => getDataFieldKey(field, dataValue)),
      
      'edges',
    ];
    
    const pageInfo = this._pageInfos.getIn([
      component.id,
      dataValue,
      connectionIdx,
    ]);
    
    if (!pageInfo) return;
    if (!pageInfo[RELAY_PAGEINFO_FIELD_HAS_NEXT_PAGE]) return;
    
    const graphQLVariables = this._graphQLVariables.get(component.id);
    
    try {
      const valueContextForVariables = {
        ...this._getValueContext(component.id),
        pageInfos: this._pageInfos.get(component.id) || null,
      };

      await observableQuery.fetchMore({
        variables: buildGraphQLQueryVariables(
          graphQLVariables,
          valueContextForVariables,
          schema,
        ),
        
        updateQuery: (previousResult, { fetchMoreResult }) => {
          const oldEdges = get(previousResult, edgesPath);
          const newEdges = get(fetchMoreResult, edgesPath);
          const combinedEdges = [...oldEdges, ...newEdges];
          const update = set({}, edgesPath, combinedEdges);
          
          return defaultsDeep(update, fetchMoreResult);
        },
      });
      
      action.params.successActions.forEach(successAction => {
        this._performAction(successAction, valueContext);
      });
    } catch (err) {
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
  _performAction(action, valueContext) {
    switch (action.type) {
      case 'mutation': this._performMutationAction(action, valueContext); break;
      case 'navigate': this._performNavigateAction(action, valueContext); break;
      case 'url': this._performURLAction(action); break;
      case 'method': this._performMethodAction(action, valueContext); break;
      case 'prop': this._performPropAction(action, valueContext); break;
      case 'logout': this._performLogoutAction(); break;
      case 'ajax': this._performAJAXAction(action, valueContext); break;
      case 'loadMoreData': this._performLoadMoreDataAction(action); break;
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
    const stateUpdates =
      getSourceConfig(resolvedTypedef, 'actions', userTypedefs).updateState;
    
    if (stateUpdates && componentId !== INVALID_ID) {
      const currentState = componentsState.get(componentId);
      
      if (currentState) {
        let nextState = currentState;
        
        forOwn(stateUpdates, (value, slotName) => {
          if (!currentState.has(slotName)) return;
          
          let newValue = NO_VALUE;
          if (value.source === 'const') {
            newValue = value.sourceData.value;
          } else if (value.source === 'arg') {
            newValue = get(
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
   * @param {number} [componentId=INVALID_ID]
   * @param {Immutable.Map<Object, DataContextsInfo>} [theMap=null]
   * @param {?Object} [data=null]
   * @return {ValueContext}
   * @private
   */
  _getValueContext(componentId = INVALID_ID, theMap = null, data = null) {
    const {
      componentsBundle,
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
        componentsBundle,
        project,
        meta,
        schema,
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
   * @param {?ValueContext} [valueContext=null]
   * @return {Object<string, *>}
   */
  _buildProps(component, valueContext = null) {
    const { meta } = this.props;
    const { dynamicPropValues } = this.state;
    
    const componentMeta = getComponentMeta(component.name, meta);
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
   * @param {?ValueContext} [valueContext=null]
   * @return {Object<string, *>}
   */
  _buildSystemProps(component, valueContext) {
    const { dynamicPropValues } = this.state;
    
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
    
    const valueContext = this._getValueContext(component.id);
    const systemProps = this._buildSystemProps(component, valueContext);
    if (!systemProps.visible) return null;
    
    if (component.name === 'Outlet') {
      return children;
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
  
  _extractPageInfos(component, queryResultRoot) {
    const { meta, schema } = this.props;
    
    const componentMeta = getComponentMeta(component.name, meta);
    let ret = Immutable.Map();
    
    const visitValue = jssyValue => {
      if (!jssyValue.isLinkedWithData()) return;
      if (jssyValue.sourceData.dataContext.size > 0) return;
      
      let currentNode = queryResultRoot;
      let currentTypeName = schema.queryTypeName;
      
      jssyValue.sourceData.queryPath.forEach((step, idx) => {
        const field = getFieldOnType(schema, currentTypeName, step.field);
        if (field.kind === FieldKinds.CONNECTION) {
          const dataFieldKey = getDataFieldKey(step.field, jssyValue);
          const pageInfo = pick(
            currentNode[dataFieldKey].pageInfo,
            RELAY_PAGEINFO_FIELDS,
          );

          if (!schema.pageInfoHasCursors) {
            const edges = currentNode[dataFieldKey].edges;
            pageInfo.startCursor = edges[0].cursor;
            pageInfo.endCursor = [...edges].pop().cursor;
          }

          ret = ret.setIn([jssyValue, idx], pageInfo);
        }

        const alias = `${step.field}${jssyValue.sourceData.aliasPostfix}`;
        
        currentNode = currentNode[alias];
        currentTypeName = field.type;
      });
    };
    
    walkSimpleValues(component, componentMeta, visitValue);
    
    return ret;
  }
  
  _createApolloHOC(component, graphQLQuery, graphQLVariables, theMap) {
    const { schema } = this.props;
    
    return graphql(graphQLQuery, {
      props: ({ ownProps, data }) => {
        const haveData = queryResultHasData(data);
        const valueContext = this._getValueContext(
          component.id,
          theMap,
          haveData ? data : null,
        );
  
        if (haveData) {
          this._pageInfos = this._pageInfos.set(
            component.id,
            this._extractPageInfos(component, data),
          );
        }
        
        return {
          ...ownProps,
          ...this._buildProps(component, valueContext),
        };
      },
  
      options: {
        variables: buildGraphQLQueryVariables(
          graphQLVariables,
          this._getValueContext(component.id),
          schema,
        ),
        
        fetchPolicy: 'cache-and-network',
      },
    });
  }
  
  /**
   *
   * @param {Object} component
   * @return {ReactElement}
   * @private
   */
  _renderComponent(component) {
    const {
      componentsBundle,
      meta,
      schema,
      project,
      theMap: thePreviousMap,
    } = this.props;

    if (isPseudoComponent(component)) {
      return this._renderPseudoComponent(component);
    }

    const Component = getComponentByName(component.name, componentsBundle);
    const { query: graphQLQuery, variables: graphQLVariables, theMap } =
      buildQueryForComponent(component, schema, meta, project);
    
    this._graphQLVariables.set(component.id, graphQLVariables);
    
    const theMergedMap = thePreviousMap
      ? thePreviousMap.merge(theMap)
      : theMap;

    const valueContext = this._getValueContext(component.id, theMergedMap);
    const systemProps = this._buildSystemProps(component, valueContext);

    if (!systemProps.visible) return null;

    const props = graphQLQuery ? {} : this._buildProps(component, valueContext);

    props.children = this._renderComponentChildren(component);
    props.key = String(component.id);
  
    if (this._renderHints.needRefs.has(component.id)) {
      props.ref = this._saveComponentRef.bind(this, component.id);
    }
    
    let Renderable = Component;
    
    if (graphQLQuery) {
      const gqlHoc = this._createApolloHOC(
        component,
        graphQLQuery,
        graphQLVariables,
        theMergedMap,
      );

      Renderable = gqlHoc(Component);
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
