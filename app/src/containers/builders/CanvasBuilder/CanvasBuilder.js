/**
 * @author Dmitriy Bizyaev
 */

import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { compose } from 'redux';
import { connect } from 'react-redux';
import forOwn from 'lodash.forown';
import get from 'lodash.get';
import { resolveTypedef } from '@jssy/types';

import CanvasComponent from './CanvasComponent';

import {
  getRenderHints,
  getInitialComponentsState,
  mergeComponentsState,
} from '../helpers';

import { alertsCreator } from '../../../hocs/alerts';
import { PlaceholderBuilder } from '../PlaceholderBuilder/PlaceholderBuilder';
import { Outlet } from '../Outlet/Outlet';
import ProjectComponent from '../../../models/ProjectComponent';
import { startDragExistingComponent } from '../../../actions/preview';

import {
  rootDraggedComponentSelector,
  getLocalizedTextFromState,
} from '../../../selectors/index';

import {
  isCompositeComponent,
  getSourceConfig,
} from '../../../lib/meta';

import {
  canInsertComponent,
  canInsertRootComponent,
} from '../../../lib/components';

import { buildValue } from '../../../lib/values';
import ComponentsBundle from '../../../lib/ComponentsBundle';
import * as JssyPropTypes from '../../../constants/common-prop-types';
import { INVALID_ID, NO_VALUE, SYSTEM_PROPS } from '../../../constants/misc';

const propTypes = {
  editable: PropTypes.bool,
  componentsBundle: PropTypes.instanceOf(ComponentsBundle).isRequired,
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
  showInvisibleComponents: PropTypes.bool.isRequired, // state
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
  showInvisibleComponents: state.app.showInvisibleComponents,
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

const componentKey = component => String(component.id);

const placeholderKey = (containerId, afterIdx) =>
  `placeholder-${containerId}:${afterIdx}`;

class CanvasBuilderComponent extends PureComponent {
  constructor(props, context) {
    super(props, context);

    this._connectedComponentsCache = new Map();

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
  }

  /**
   * Constructs system props object
   *
   * @param {Object} component
   * @param {?ValueContext} [valueContext=null]
   * @return {Object<string, *>}
   */
  _buildSystemProps(component, valueContext = null) {
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
   * @param {boolean} isInvisible
   * @return {ReactElement}
   * @private
   */
  _renderOutletComponent(component, isInvisible) {
    const props = {
      key: componentKey(component),
    };

    this._patchComponentProps(props, component.id, false, isInvisible);

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
    const { showInvisibleComponents, children } = this.props;

    const systemProps = this._buildSystemProps(component, null);
    if (!showInvisibleComponents && !systemProps.visible) return null;

    if (component.name === 'Outlet') {
      return children || this._renderOutletComponent(
        component,
        !systemProps.visible,
      );
    } else {
      return null;
    }
  }

  /**
   *
   * @param {Object} component
   * @return {*}
   * @private
   */
  _renderEmptyListComponent(list) {
    const componentValue = list.props.get('component');

    if (componentValue.sourceData.rootId === INVALID_ID) return null;

    const rootListComponent = componentValue.sourceData.components
      .get(componentValue.sourceData.rootId);

    // Changing rootListComponent ID here in order
    // to everyone outside recognize it as initial List
    return this._renderComponent(rootListComponent.set('id', list.id));
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
      componentsBundle,
      rootDraggedComponent,
      draggedComponents,
      draggingOverPlaceholder,
      placeholderContainerId,
      placeholderAfter,
    } = this.props;

    const collapsed =
      !draggingOverPlaceholder ||
      placeholderContainerId !== containerId ||
      placeholderAfter !== afterIdx;

    return (
      <PlaceholderBuilder
        key={placeholderKey(containerId, afterIdx)}
        componentsBundle={componentsBundle}
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
   * @param {boolean} isHTMLComponent
   * @param {boolean} isInvisible
   * @private
   */
  _patchComponentProps(props, componentId, isHTMLComponent, isInvisible) {
    if (isHTMLComponent) {
      props['data-jssy-id'] = String(componentId);
      if (isInvisible) props['data-jssy-invisible'] = '';
    } else {
      props.__jssy_component_id__ = componentId;
      if (isInvisible) props.__jssy_invisible__ = true;
    }
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
      componentsBundle,
      project,
      editable,
      dontPatch,
      showInvisibleComponents,
      components,
      propsFromOwner,
      dataContextInfo,
      routeParams,
      getLocalizedText,
      onAlert,
      showContentPlaceholders,
    } = this.props;

    return (
      <CanvasComponent
        component={component}
        meta={meta}
        componentsBundle={componentsBundle}
        schema={schema}
        project={project}
        components={components}
        propsFromOwner={propsFromOwner}
        dataContextInfo={dataContextInfo}
        routeParams={routeParams}
        BuilderComponent={CanvasBuilder}
        renderComponentChildren={
          this._renderComponentChildren.bind(this)
        }
        dontPatch={dontPatch}
        getLocalizedText={getLocalizedText}
        onAlert={onAlert}
        editable={editable}
        parentComponent={parentComponent}
        handleComponentDragStart={
          this._handleComponentDragStart
        }
        showInvisibleComponents={showInvisibleComponents}
        renderEmptyListComponent={
          this._renderEmptyListComponent.bind(this)
        }
        renderPseudoComponent={
          this._renderPseudoComponent.bind(this)
        }
        componentsState={
          this.state.componentsState
        }
        showContentPlaceholders={showContentPlaceholders}
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
