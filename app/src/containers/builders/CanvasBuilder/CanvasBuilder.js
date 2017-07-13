/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import _forOwn from 'lodash.forown';
import _get from 'lodash.get';
import _debounce from 'lodash.debounce';
import { resolveTypedef } from '@jssy/types';

import {
  getRenderHints,
  getInitialComponentsState,
  mergeComponentsState,
} from '../helpers';

import { alertsCreator } from '../../../hocs/alerts';
import { wrapComponent as draggable } from '../../../hocs/draggable';
import { PlaceholderBuilder } from '../PlaceholderBuilder/PlaceholderBuilder';
import { connectDraggable } from '../../ComponentsDragArea/ComponentsDragArea';
import { ContentPlaceholder } from '../ContentPlaceholder/ContentPlaceholder';
import { Outlet } from '../Outlet/Outlet';
import ProjectComponent from '../../../models/ProjectComponent';
import { startDragExistingComponent } from '../../../actions/preview';

import {
  selectedComponentIdsSelector,
  highlightedComponentIdsSelector,
  rootDraggedComponentSelector,
  getLocalizedTextFromState,
} from '../../../selectors/index';

import {
  isContainerComponent,
  isCompositeComponent,
  getComponentMeta,
  getSourceConfig,
} from '../../../lib/meta';

import {
  canInsertComponent,
  canInsertRootComponent,
} from '../../../lib/components';

import { buildQueryForComponent } from '../../../lib/graphql';
import { buildValue, buildGraphQLQueryVariables } from '../../../lib/values';
import { queryResultHasData } from '../../../lib/apollo';

import {
  getComponentByName,
  isHTMLComponent,
} from '../../../lib/react-components';

import * as JssyPropTypes from '../../../constants/common-prop-types';
import { INVALID_ID, NO_VALUE, SYSTEM_PROPS } from '../../../constants/misc';
import { DND_DRAG_START_RADIUS_CANVAS } from '../../../config';

const propTypes = {
  editable: PropTypes.bool,
  components: JssyPropTypes.components.isRequired,
  rootId: PropTypes.number,
  routeParams: PropTypes.object,
  enclosingComponents: JssyPropTypes.components,
  enclosingContainerId: PropTypes.number,
  enclosingAfterIdx: PropTypes.number,
  dontPatch: PropTypes.bool,
  propsFromOwner: PropTypes.object,
  theMap: PropTypes.object,
  dataContextInfo: PropTypes.object,
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
  onAlert: PropTypes.func.isRequired, // alertsCreator
  onStartDragComponent: PropTypes.func.isRequired, // dispatch
};

const defaultProps = {
  editable: false,
  components: null,
  rootId: INVALID_ID,
  routeParams: {},
  enclosingComponents: null,
  enclosingContainerId: INVALID_ID,
  enclosingAfterIdx: -1,
  dontPatch: false,
  propsFromOwner: {},
  theMap: null,
  dataContextInfo: null,
  draggedComponents: null,
  rootDraggedComponent: null,
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
  alertsCreator,
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

class CanvasBuilderComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);
    
    this._renderHints = getRenderHints(
      props.components,
      props.rootId,
      props.meta,
      props.schema,
      props.project,
    );
  
    this.state = {
      componentsState: getInitialComponentsState(
        props.components,
        props.meta,
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
   * @param {Object} component
   * @param {Error} error
   * @param {string} hookName
   * @private
   */
  _handleErrorInComponentLifecycleHook(component, error, hookName) {
    const { getLocalizedText, onAlert } = this.props;
    
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
  
  /**
   *
   * @param {number} componentId
   * @param {JssyValueDefinition} valueDef
   * @param {Object<string, JssyTypeDefinition>} userTypedefs
   * @param {ValueContext} valueContext
   * @private
   */
  _handleActions(componentId, valueDef, userTypedefs, valueContext) {
    const { componentsState } = this.state;
  
    const resolvedTypedef = resolveTypedef(valueDef, userTypedefs);
    const stateUpdates =
      getSourceConfig(resolvedTypedef, 'actions', userTypedefs).updateState;
  
    if (stateUpdates && componentId !== INVALID_ID) {
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
      meta,
      schema,
      project,
      components,
      propsFromOwner,
      dataContextInfo,
      routeParams,
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
      BuilderComponent: CanvasBuilder, // eslint-disable-line no-use-before-define
      getBuilderProps: (ownProps, jssyValue, valueContext) => ({
        routeParams,
        components: jssyValue.sourceData.components,
        rootId: jssyValue.sourceData.rootId,
        dontPatch: true,
        propsFromOwner: ownProps,
        theMap: valueContext.theMap,
        dataContextInfo: valueContext.theMap.get(jssyValue),
      }),
  
      handleActions: (jssyValue, valueDef, userTypedefs, valueContext) => {
        this._handleActions(
          componentId,
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
    
    const componentMeta = getComponentMeta(component.name, meta);
    const valueContext = this._getValueContext(component.id, theMap, data);
    const ret = {};

    component.props.forEach((propValue, propName) => {
      const valueDef = componentMeta.props[propName];
      const userTypedefs = componentMeta.types;
      const value = buildValue(propValue, valueDef, userTypedefs, valueContext);

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
    const valueContext = this._getValueContext(component.id, theMap);
    const ret = {};
    
    component.systemProps.forEach((propValue, propName) => {
      const valueDef = SYSTEM_PROPS[propName];
      const value = buildValue(propValue, valueDef, null, valueContext);

      if (value !== NO_VALUE) ret[propName] = value;
    });
    
    return ret;
  }
  
  /**
   *
   * @param {Object} component
   * @return {ReactElement}
   * @private
   */
  _renderOutletComponent(component) {
    const props = {};
    this._patchComponentProps(props, component.id);
    
    return (
      <Outlet {...props} />
    );
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
      return children || this._renderOutletComponent(component);
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
      <PlaceholderBuilder
        key={key}
        components={draggedComponents}
        rootId={rootDraggedComponent.id}
        collapsedToPoint={collapsed}
        containerId={containerId}
        afterIdx={afterIdx}
      />
    );
  }

  /**
   *
   * @param {ProjectComponent} component
   * @return {?ReactElement[]}
   * @private
   */
  _renderComponentChildren(component) {
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
      if (isComposite && !component.regionsEnabled.has(idx)) {
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

      const rendered = this._renderComponent(childComponent, component);
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
   * @param {Object} component
   * @return {boolean}
   * @private
   */
  _willRenderContentPlaceholder(component) {
    const {
      meta,
      showContentPlaceholders,
      highlightedComponentIds,
      selectedComponentIds,
    } = this.props;
    
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
   * @return {ReactElement}
   * @private
   */
  _renderComponent(component, parentComponent = null) {
    const {
      meta,
      schema,
      project,
      editable,
      dontPatch,
      theMap: thePreviousMap,
      getLocalizedText,
      onAlert,
    } = this.props;

    if (isPseudoComponent(component)) {
      return this._renderPseudoComponent(component);
    }

    const Component = getConnectedComponent(component.name);
    const { query: graphQLQuery, variables: graphQLVariables, theMap } =
      buildQueryForComponent(component, schema, meta, project);
    
    const theMergedMap = thePreviousMap
      ? thePreviousMap.merge(theMap)
      : theMap;

    const systemProps = this._buildSystemProps(component, theMergedMap);

    if (!systemProps.visible) return null;

    const props = graphQLQuery ? {} : this._buildProps(component, theMergedMap);

    props.children = this._renderComponentChildren(component);

    if (!isHTMLComponent(component.name)) {
      props.__jssy_error_handler__ = _debounce(
        this._handleErrorInComponentLifecycleHook.bind(this, component),
        250,
      );
    }

    props.key = String(component.id);

    if (!dontPatch) {
      this._patchComponentProps(props, component.id);
    }

    if (!props.children && this._willRenderContentPlaceholder(component)) {
      props.children = (
        <ContentPlaceholder />
      );
    }
    
    let Renderable = Component;

    if (graphQLQuery) {
      const gqlHoc = graphql(graphQLQuery, {
        props: ({ ownProps, data }) => {
          if (data.error) {
            const message = getLocalizedText('alert.queryError', {
              message: data.error.message,
            });

            setTimeout(() => void onAlert({ content: message }), 0);
          }

          return {
            ...ownProps,
            innerProps: this._buildProps(
              component,
              theMergedMap,
              queryResultHasData(data) ? data : null,
            ),
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

      Renderable = gqlHoc(Component);
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
      draggingComponent,
      rootDraggedComponent,
    } = this.props;
    
    if (rootId !== INVALID_ID) {
      const rootComponent = components.get(rootId);
      return this._renderComponent(rootComponent, null);
    } else if (editable && draggingComponent) {
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

CanvasBuilderComponent.propTypes = propTypes;
CanvasBuilderComponent.defaultProps = defaultProps;
CanvasBuilderComponent.displayName = 'CanvasBuilder';

export const CanvasBuilder = wrap(CanvasBuilderComponent);