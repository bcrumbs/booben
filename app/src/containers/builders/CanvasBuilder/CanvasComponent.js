import React from 'react';
import debounce from 'lodash.debounce';
import { compose } from 'redux';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';

import { buildQueryForComponent } from '../../../lib/graphql';
import { queryResultHasData } from '../../../lib/apollo';

import {
  isHTMLComponent,
  getComponentMeta,
  isCompositeComponent,
  isContainerComponent,
} from '../../../lib/meta';

import { buildValue, buildGraphQLQueryVariables } from '../../../lib/values';

import {
  formatComponentTitle,
} from '../../../lib/components';

import {
  isPseudoComponent,
  isEmptyListComponent,
  getComponentByName,
} from '../helpers';

import { ContentPlaceholder } from '../ContentPlaceholder/ContentPlaceholder';

import { NO_VALUE, INVALID_ID, SYSTEM_PROPS } from '../../../constants/misc';
import { DND_DRAG_START_RADIUS_CANVAS } from '../../../config';

import { connectDraggable } from '../../ComponentsDragArea/ComponentsDragArea';
import { wrapComponent as draggable } from '../../../hocs/draggable';

import {
  selectedComponentIdsSelector,
  highlightedComponentIdsSelector,
} from '../../../selectors/index';

const componentKey = component => String(component.id);

const patchComponentProps = (
  props,
  componentId,
  isHTMLComponent,
  isInvisible,
) => {
  if (isHTMLComponent) {
    props['data-jssy-id'] = String(componentId);
    if (isInvisible) props['data-jssy-invisible'] = '';
  } else {
    props.__jssy_component_id__ = componentId;
    if (isInvisible) props.__jssy_invisible__ = true;
  }
};

const wrap = connect(
  (state, { component, meta, showContentPlaceholders }) => {
    const selectedComponentIds = selectedComponentIdsSelector(state);
    const highlightedComponentIds = highlightedComponentIdsSelector(state);

    const willRenderContentPlaceholder =
      isContainerComponent(component.name, meta) && (
        showContentPlaceholders ||
        highlightedComponentIds.has(component.id) ||
        selectedComponentIds.has(component.id)
      );

    return {
      willRenderContentPlaceholder,
    };
  },
);

class CanvasComponent extends React.PureComponent {
  _buildProps(valueContext) {
    const {
      component,
      meta,
    } = this.props;

    const componentMeta = getComponentMeta(component.name, meta);
    const ret = {};

    component.props.forEach((propValue, propName) => {
      const valueDef = componentMeta.props[propName];
      const userTypedefs = componentMeta.types;
      const value = buildValue(propValue, valueDef, userTypedefs, valueContext);

      if (value !== NO_VALUE) ret[propName] = value;
    });

    return ret;
  }

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
      BuilderComponent,
      componentsState,
    } = this.props;

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
      BuilderComponent,
      getBuilderProps: (ownProps, jssyValue, valueContext) => ({
        componentsBundle,
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

  _handleErrorInComponentLifecycleHook(error, hookName) {
    const { getLocalizedText, onAlert, component } = this.props;

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

  _createProps(graphQLQuery, theMap, systemProps) {
    const {
      component,
      renderComponentChildren,
      dontPatch,
      meta,
      willRenderContentPlaceholder,
    } = this.props;

    const valueContext = this._getValueContext(
      component.id,
      theMap,
    );
    const props = graphQLQuery ? {} : this._buildProps(valueContext);
  
    props.children = renderComponentChildren(component);
  
    const isHTML = isHTMLComponent(component.name);
    if (isHTML) {
      props.style = component.style;
    } else {
      props.__jssy_error_handler__ = debounce(
        this._handleErrorInComponentLifecycleHook,
        250,
      );
    }
  
    props.key = componentKey(component);
  
    if (!dontPatch) {
      patchComponentProps(
        props,
        component.id,
        isHTML,
        !systemProps.visible,
      );
    }
  
    if (!props.children && willRenderContentPlaceholder) {
      props.children = (
        <ContentPlaceholder />
      );
    }
  
    return props;
  }

  _createApolloHOC(graphQLQuery, graphQLVariables, theMap) {
    const {
      component,
      schema,
      dontPatch,
      getLocalizedText,
      onAlert,
    } = this.props;

    return graphql(graphQLQuery, {
      props: ({ ownProps, data }) => {
        if (data.error) {
          const message = getLocalizedText('alert.queryError', {
            message: data.error.message,
          });

          setTimeout(() => void onAlert({ content: message }), 0);
        }

        const haveData = queryResultHasData(data);
        const valueContext = this._getValueContext(
          component.id,
          theMap,
          haveData ? data : null,
        );

        if (dontPatch) {
          return {
            ...ownProps,
            ...this._buildProps(valueContext),
          };
        } else {
          return {
            ...ownProps,
            innerProps: {
              ...ownProps.innerProps,
              ...this._buildProps(valueContext),
            },
          };
        }
      },

      options: {
        variables: buildGraphQLQueryVariables(
          graphQLVariables,
          this._getValueContext(component.id),
          schema,
        ),

        fetchPolicy: 'cache-first',
      },
    });
  }

  _buildSystemProps(component, valueContext = null) {
    const ret = {};

    component.systemProps.forEach((propValue, propName) => {
      const valueDef = SYSTEM_PROPS[propName];
      const value = buildValue(propValue, valueDef, null, valueContext);

      if (value !== NO_VALUE) ret[propName] = value;
    });

    return ret;
  }

  render() {
    const {
      dontPatch,
      editable,
      component,
      handleComponentDragStart,
      schema,
      meta,
      project,
      componentsBundle,
      showInvisibleComponents,
      renderEmptyListComponent,
      renderPseudoComponent,
      parentComponent,
    } = this.props;
 
    const isDraggable =
      editable &&
      parentComponent !== null &&
      !isCompositeComponent(parentComponent.name, meta);

    if (isEmptyListComponent(component)) {
      return renderEmptyListComponent(component);
    }
  
    if (isPseudoComponent(component)) {
      return renderPseudoComponent(component);
    }

    const { query: graphQLQuery, variables: graphQLVariables, theMap } =
      buildQueryForComponent(component, schema, meta, project);

    const valueContext = this._getValueContext(component.id, theMap);
    const systemProps = this._buildSystemProps(component, valueContext);
  
    if (!showInvisibleComponents && !systemProps.visible) return null;

    const props = this._createProps(graphQLQuery, theMap, systemProps);

    let Component = getComponentByName(component.name, componentsBundle);

    const hocs = [];
    if (graphQLQuery) {
      const gqlHoc = this._createApolloHOC(
        graphQLQuery,
        graphQLVariables,
        theMap,
      );

      hocs.push(gqlHoc);
    }
    if (!dontPatch) {
      hocs.push(connectDraggable);
      hocs.push(draggable);
    }

    if (hocs.length) {
      Component = compose(...hocs)(Component);
    }

    if (dontPatch) {
      return (
        <Component {...props} />
      );
    } else {
      return (
        <Component
          key={props.key}
          innerProps={props}
          dragEnable={isDraggable}
          dragTitle={formatComponentTitle(component)}
          dragData={{ componentId: component.id }}
          dragStartRadius={DND_DRAG_START_RADIUS_CANVAS}
          onDragStart={handleComponentDragStart}
        />
      );
    }
  }
}

export default wrap(CanvasComponent);
