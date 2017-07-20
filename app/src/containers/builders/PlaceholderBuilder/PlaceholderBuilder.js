/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import _debounce from 'lodash.debounce';
import { alertsCreator } from '../../../hocs/alerts';
import { ContentPlaceholder } from '../ContentPlaceholder/ContentPlaceholder';
import { Outlet } from '../Outlet/Outlet';
import { getLocalizedTextFromState } from '../../../selectors/index';

import {
  getRenderHints,
  getInitialComponentsState,
  mergeComponentsState,
} from '../helpers';

import collapsingToPoint from '../../../hocs/collapsingToPoint';

import {
  isContainerComponent,
  isCompositeComponent,
  getComponentMeta,
} from '../../../lib/meta';

import { buildQueryForComponent } from '../../../lib/graphql';
import { buildValue, buildGraphQLQueryVariables } from '../../../lib/values';
import { queryResultHasData } from '../../../lib/apollo';

import {
  getComponentByName,
  isHTMLComponent,
} from '../../../lib/react-components';

import { noop } from '../../../utils/misc';
import * as JssyPropTypes from '../../../constants/common-prop-types';
import { INVALID_ID, NO_VALUE, SYSTEM_PROPS } from '../../../constants/misc';

const propTypes = {
  components: JssyPropTypes.components.isRequired,
  rootId: PropTypes.number,
  routeParams: PropTypes.object,
  dontPatch: PropTypes.bool,
  afterIdx: PropTypes.number,
  containerId: PropTypes.number,
  propsFromOwner: PropTypes.object,
  theMap: PropTypes.object,
  dataContextInfo: PropTypes.object,
  project: PropTypes.any.isRequired, // state
  meta: PropTypes.object.isRequired, // state
  schema: PropTypes.object.isRequired, // state
  getLocalizedText: PropTypes.func.isRequired, // state
  onAlert: PropTypes.func.isRequired, // alertsCreator
};

const defaultProps = {
  components: null,
  rootId: INVALID_ID,
  routeParams: {},
  dontPatch: false,
  afterIdx: -1,
  containerId: INVALID_ID,
  propsFromOwner: {},
  theMap: null,
  dataContextInfo: null,
  draggedComponents: null,
  rootDraggedComponent: null,
};

const contextTypes = {
  window: PropTypes.object,
};

const mapStateToProps = state => ({
  project: state.project.data,
  meta: state.project.meta,
  schema: state.project.schema,
  getLocalizedText: getLocalizedTextFromState(state),
});

const wrap = compose(
  connect(mapStateToProps),
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
const PSEUDO_COMPONENTS = new Set(['Text', 'Outlet', 'List']);

/**
 *
 * @param {ProjectComponent} component
 * @return {boolean}
 */
const isPseudoComponent = component => PSEUDO_COMPONENTS.has(component.name);

class PlaceholderBuilderComponent extends PureComponent {
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
   * @param {Immutable.Map<Object, DataContextsInfo>} [theMap=null]
   * @param {?Object} [data=null]
   * @return {ValueContext}
   * @private
   */
  _getValueContext(theMap = null, data = null) {
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
      BuilderComponent: PlaceholderBuilder, // eslint-disable-line no-use-before-define
      getBuilderProps: (ownProps, jssyValue, valueContext) => ({
        routeParams,
        components: jssyValue.sourceData.components,
        rootId: jssyValue.sourceData.rootId,
        dontPatch: true,
        propsFromOwner: ownProps,
        theMap: valueContext.theMap,
        dataContextInfo: valueContext.theMap.get(jssyValue),
      }),

      handleActions: noop,
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
    const valueContext = this._getValueContext(theMap, data);
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
    const valueContext = this._getValueContext(theMap);
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
   * @param {Object} props
   * @param {boolean} isHTMLComponent
   * @private
   */
  _patchPlaceholderRootProps(props, isHTMLComponent) {
    const { containerId, afterIdx } = this.props;

    if (isHTMLComponent) {
      props['data-jssy-placeholder'] = '';
      props['data-jssy-after'] = String(afterIdx);
      props['data-jssy-container-id'] = String(containerId);
    } else {
      props.__jssy_placeholder__ = true;
      props.__jssy_after__ = afterIdx;
      props.__jssy_container_id__ = containerId;
    }
  }

  /**
   *
   * @param {boolean} [isRoot=false]
   * @return {ReactElement}
   * @private
   */
  _renderOutletComponent(isRoot = false) {
    const props = {};
    if (isRoot) this._patchPlaceholderRootProps(props, false);

    return (
      <Outlet {...props} />
    );
  }

  /**
   *
   * @param {Object} component
   * @param {boolean} [isRoot=false]
   * @return {*}
   * @private
   */
  _renderPseudoComponent(component, isRoot = false) {
    const systemProps = this._buildSystemProps(component, null);
    if (!systemProps.visible) return null;

    const props = this._buildProps(component, null);

    if (component.name === 'Outlet') {
      return this._renderOutletComponent(isRoot);
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
      if (Array.isArray(rendered)) ret.push(...rendered);
      else ret.push(rendered);
    });

    return ret.length > 0 ? ret : null;
  }

  /**
   *
   * @param {Object} component
   * @param {boolean} [isRoot=false]
   * @return {ReactElement}
   * @private
   */
  _renderComponent(component, isRoot = false) {
    const {
      meta,
      schema,
      project,
      dontPatch,
      theMap: thePreviousMap,
      containerId,
      afterIdx,
      getLocalizedText,
      onAlert,
    } = this.props;

    if (isPseudoComponent(component)) {
      return this._renderPseudoComponent(component, isRoot);
    }

    const Component = getComponentByName(component.name);
    const isHTML = isHTMLComponent(component.name);
    const { query: graphQLQuery, variables: graphQLVariables, theMap } =
      buildQueryForComponent(component, schema, meta, project);

    const theMergedMap = thePreviousMap ? thePreviousMap.merge(theMap) : theMap;
    const systemProps = this._buildSystemProps(component, theMergedMap);

    if (!systemProps.visible) return null;

    const props = graphQLQuery ? {} : this._buildProps(component, theMergedMap);

    props.children = this._renderComponentChildren(component);

    if (!isHTML) {
      props.__jssy_error_handler__ = _debounce(
        this._handleErrorInComponentLifecycleHook.bind(this, component),
        250,
      );
    }

    props.key = `placeholder-${containerId}:${afterIdx}-${component.id}`;

    if (isRoot && !dontPatch) {
      this._patchPlaceholderRootProps(props, isHTML);
    }

    if (isContainerComponent(component.name, meta) && !props.children) {
      props.children = <ContentPlaceholder />;
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

          const props = this._buildProps(
            component,
            theMergedMap,
            queryResultHasData(data) ? data : null,
          );

          return { ...ownProps, ...props };
        },

        options: {
          variables: buildGraphQLQueryVariables(
            graphQLVariables,
            this._getValueContext(),
            schema,
          ),

          fetchPolicy: 'cache-and-network',
        },
      });

      Renderable = gqlHoc(Component);
    }

    return (
      <Renderable {...props} />
    );
  }

  render() {
    const { components, rootId } = this.props;

    return rootId !== INVALID_ID
      ? this._renderComponent(components.get(rootId), true)
      : null;
  }
}

PlaceholderBuilderComponent.propTypes = propTypes;
PlaceholderBuilderComponent.defaultProps = defaultProps;
PlaceholderBuilderComponent.contextTypes = contextTypes;
PlaceholderBuilderComponent.displayName = 'PlaceholderBuilder';

export const PlaceholderBuilder = wrap(PlaceholderBuilderComponent);
