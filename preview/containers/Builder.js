'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import _merge from 'lodash.merge';
import _mapValues from 'lodash.mapvalues';
import { resolveTypedef } from '@jssy/types';
import { getComponentById } from '../../app/models/Project';

import {
  walkComponentsTree,
  walkSimpleProps,
} from '../../app/models/ProjectComponent';

import jssyConstants from '../../app/constants/jssyConstants';
import { NO_VALUE } from '../../app/constants/misc';
import { ContentPlaceholder } from '../components/ContentPlaceholder';
import { Outlet } from '../components/Outlet';
import getComponentByName from '../getComponentByName';
import isPseudoComponent from '../isPseudoComponent';

import {
  currentSelectedComponentIdsSelector,
  currentHighlightedComponentIdsSelector,
} from '../../app/selectors';

import {
  isContainerComponent,
  isCompositeComponent,
  canInsertComponent,
  getComponentMeta,
} from '../../app/utils/meta';

import {
  buildQueryForComponent,
  mapDataToComponentProps,
  extractPropValueFromData,
} from '../../app/utils/graphql';

import { getFunctionInfo } from '../../app/utils/functions';
import { noop, returnNull } from '../../app/utils/misc';

class BuilderComponent extends PureComponent {
  constructor(props) {
    super(props);
    
    this._renderHints = this._getRenderHints(props.components, props.rootId);
    this._refs = new Map();
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
    }
  }
  
  _getRenderHints(components, rootId) {
    const { meta } = this.props;
    
    const ret = {
      needRefs: new Set(),
      passMutations: new Map(),
    };
    
    if (rootId === -1) return ret;
  
    walkComponentsTree(components, rootId, component => {
      const componentMeta = getComponentMeta(component.name, meta);
      
      walkSimpleProps(component, componentMeta, propValue => {
        if (propValue.source === 'actions') {
          propValue.sourceData.actions.forEach(action => {
            if (action.type === 'method') {
              ret.needRefs.add(action.params.componentId);
            } else if (action.type === 'mutation') {
              let mutationsForComponent = ret.passMutations.get(component.id);
              
              if (!mutationsForComponent) {
                mutationsForComponent = new Set();
                ret.passMutations.set(component.id, mutationsForComponent);
              }
              
              mutationsForComponent.add(action.params.mutation);
            }
          });
        }
      });
    });
    
    return ret;
  }
  
  _saveComponentRef(componentId, ref) {
    this._refs.set(componentId, ref);
  }
  
  /**
   *
   * @param {Object} propValue
   * @param {Immutable.Map<Object, Object>} theMap
   * @return {Function}
   */
  _makeBuilderForProp(propValue, theMap) {
    const {
      interactive,
      onNavigate,
      onOpenURL,
    } = this.props;
    
    return props => (
      <Builder
        interactive={interactive}
        components={propValue.sourceData.components}
        rootId={propValue.sourceData.rootId}
        dontPatch
        propsFromOwner={props}
        theMap={theMap}
        dataContextInfo={theMap.get(propValue)}
        onNavigate={onNavigate}
        onOpenURL={onOpenURL}
      >
        {props.children}
      </Builder>
    );
  }

  /**
   *
   * @param {Object} jssyValue
   * @param {JssyTypeDefinition} typedef
   * @param {Object<string, JssyTypeDefinition>} userTypedefs
   * @param {Immutable.Map<Object, Object>} theMap
   * @return {*}
   */
  _buildValue(jssyValue, typedef, userTypedefs, theMap) {
    const {
      project,
      schema,
      isPlaceholder,
      propsFromOwner,
      ignoreOwnerProps,
      dataContextInfo,
      onNavigate,
      onOpenURL,
    } = this.props;
    
    const resolvedTypedef = resolveTypedef(typedef, userTypedefs);
    
    if (jssyValue.source === 'static') {
      if (jssyValue.sourceData.ownerPropName && !ignoreOwnerProps) {
        return propsFromOwner[jssyValue.sourceData.ownerPropName];
      } else if (resolvedTypedef.type === 'shape') {
        if (jssyValue.sourceData.value === null) return null;

        return _mapValues(resolvedTypedef.fields, (fieldMeta, fieldName) => {
          const fieldValue = jssyValue.sourceData.value.get(fieldName);

          return this._buildValue(
            fieldValue,
            fieldMeta,
            userTypedefs,
            theMap,
          );
        });
      } else if (resolvedTypedef.type === 'objectOf') {
        if (jssyValue.sourceData.value === null) return null;

        return jssyValue.sourceData.value.map(nestedValue =>
          this._buildValue(
            nestedValue,
            resolvedTypedef.ofType,
            userTypedefs,
            theMap,
          ),
        ).toJS();
      } else if (resolvedTypedef.type === 'arrayOf') {
        return jssyValue.sourceData.value.map(nestedValue =>
          this._buildValue(
            nestedValue,
            resolvedTypedef.ofType,
            userTypedefs,
            theMap,
          ),
        ).toJS();
      } else {
        return jssyValue.sourceData.value;
      }
    } else if (jssyValue.source === 'const') {
      return jssyValue.sourceData.jssyConstId
        ? jssyConstants[jssyValue.sourceData.jssyConstId]
        : jssyValue.sourceData.value;
    } else if (jssyValue.source === 'designer') {
      return jssyValue.sourceData.components && jssyValue.sourceData.rootId > -1
        ? this._makeBuilderForProp(jssyValue, theMap)
        : returnNull;
    } else if (jssyValue.source === 'data') {
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
      }
    } else if (jssyValue.source === 'function') {
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
          );
        }

        if (ret === NO_VALUE) ret = argInfo.defaultValue;
        return ret;
      });

      // TODO: Pass fns as last argument
      return fnInfo.fn(...argValues, {});
    } else if (jssyValue.source === 'actions') {
      return () => {
        jssyValue.sourceData.actions.forEach(action => {
          switch (action.type) {
            case 'mutation': {
              // TODO: Call mutation
              break;
            }
            
            case 'navigate': {
              const routeParams = {};
              
              action.params.routeParams.forEach((paramValue, paramName) => {
                const value = this._buildValue(
                  paramValue,
                  { type: 'string' },
                  null,
                  theMap,
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
              if (isPlaceholder) break;
              
              const componentInstance =
                this._refs.get(action.params.componentId);
              
              if (componentInstance) {
                const args = [];
                
                action.params.args.forEach((argValue, idx) => {
                  const argTypedef = resolveTypedef(
                    resolvedTypedef.sourceConfigs.actions.args[idx],
                    userTypedefs,
                  );
                  
                  const value = this._buildValue(
                    argValue,
                    argTypedef,
                    userTypedefs,
                    theMap,
                  );
                  
                  args.push(value !== NO_VALUE ? value : void 0);
                });
  
                componentInstance[action.params.method](...args);
              }
              
              break;
            }
            
            default:
          }
        });
      };
    }

    return NO_VALUE;
  }

  /**
   * Constructs props object
   *
   * @param {Object} component
   * @param {Immutable.Map<Object, Object>} theMap
   * @return {Object<string, *>}
   */
  _buildProps(component, theMap) {
    const componentMeta = getComponentMeta(component.name, this.props.meta);
    const ret = {};

    component.props.forEach((propValue, propName) => {
      const propMeta = componentMeta.props[propName];
      const value = this._buildValue(
        propValue,
        propMeta,
        componentMeta.types,
        theMap,
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
    if (component.name === 'Outlet') {
      return this.props.interactive ? <Outlet /> : this.props.children;
    } else if (component.name === 'Text') {
      const props = this._buildProps(component, null);
      return props.text || '';
    } else if (component.name === 'List') {
      const props = this._buildProps(component, null),
        ItemComponent = props.component;

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
    const rootDraggedComponentId = this.props.draggedComponentId > -1
      ? this.props.draggedComponentId
      : 0;

    const rootDraggedComponent =
      this.props.draggedComponents.get(rootDraggedComponentId);

    const containerComponent = this._getContainerComponent(containerId);

    let canDropHere = true;
    if (containerComponent) {
      const containerChildrenNames = containerComponent.children
        .map(id => this.props.components.get(id).name);

      canDropHere = canInsertComponent(
        rootDraggedComponent.name,
        containerComponent.name,
        containerChildrenNames,
        afterIdx + 1,
        this.props.meta,
      );
    }

    if (!canDropHere) return null;

    const key = `placeholder-${containerId}:${afterIdx}`;

    //noinspection JSValidateTypes
    return (
      <Builder
        key={key}
        components={this.props.draggedComponents}
        rootId={rootDraggedComponentId}
        isPlaceholder
        afterIdx={afterIdx}
        containerId={containerId}
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
    if (component.children.size === 0) return null;

    const ret = [];
    const isComposite = isCompositeComponent(component.name, this.props.meta);

    component.children.forEach((childComponentId, idx) => {
      const childComponent = this.props.components.get(childComponentId);

      // Do not render disabled regions in composite components
      if (!isPlaceholder && isComposite && !component.regionsEnabled.has(idx))
        return;

      const needPlaceholders =
        !isPlaceholder &&
        this.props.draggingComponent &&
        childComponent.id === this.props.draggingOverComponentId;

      if (needPlaceholders) {
        // Render placeholders for the component being dragged
        // before and after the component user is dragging over
        ret.push(this._renderPlaceholderForDraggedComponent(
          component.id,
          idx - 1,
        ));
        ret.push(this._renderComponent(childComponent, isPlaceholder));
        ret.push(this._renderPlaceholderForDraggedComponent(
          component.id,
          idx,
        ));
      } else {
        ret.push(this._renderComponent(childComponent, isPlaceholder));
      }
    });

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
    
    return this.props.showContentPlaceholders ||
      this.props.highlightedComponentIds.has(component.id) ||
      this.props.selectedComponentIds.has(component.id);
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
    // Do not render component that's being dragged right now
    if (component.id === this.props.draggedComponentId && !isPlaceholder)
      return null;

    // Handle special components like Text, Outlet etc.
    if (isPseudoComponent(component))
      return this._renderPseudoComponent(component);

    // Get component class
    const Component = getComponentByName(component.name);
    const isHTMLComponent = typeof Component === 'string';

    // Build GraphQL query
    const { query: graphQLQuery, theMap } = buildQueryForComponent(
      component,
      this.props.schema,
      this.props.meta,
      this.props.project,
    );

    // Build props
    const props = this._buildProps(
      component,
      this.props.theMap ? this.props.theMap.merge(theMap) : theMap,
    );

    // Render children
    props.children = this._renderComponentChildren(component, isPlaceholder);

    if (!isPlaceholder) {
      props.key = component.id;
      
      if (this._renderHints.needRefs.has(component.id))
        props.ref = this._saveComponentRef.bind(this, component.id);

      if (this.props.interactive && !this.props.dontPatch)
        this._patchComponentProps(props, isHTMLComponent, component.id);

      if (this.props.draggingComponent) {
        // User is dragging something
        const willRenderPlaceholderInside =
          isContainerComponent(component.name, this.props.meta) && (
            !props.children || (
              component.children.size === 1 &&
              component.children.first() === this.props.draggedComponentId
            )
          );

        // Render placeholders inside empty containers
        if (willRenderPlaceholderInside) {
          props.children = this._renderPlaceholderForDraggedComponent(
            component.id,
            -1,
          );
        }
      } else if (this._willRenderContentPlaceholder(component)) {
        const willRenderContentPlaceholder =
          !props.children &&
          isContainerComponent(component.name, this.props.meta);

        if (willRenderContentPlaceholder)
          props.children = <ContentPlaceholder />;
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
      if (willRenderContentPlaceholder)
        props.children = <ContentPlaceholder />;
    }
    
    let Renderable = Component;

    if (graphQLQuery) {
      Renderable = graphql(graphQLQuery, {
        props: ({ ownProps, data }) => {
          // TODO: Better check
          if (Object.keys(data).length <= 10) return ownProps;

          const dataProps = mapDataToComponentProps(
            component,
            data,
            this.props.schema,
            this.props.meta,
          );

          return _merge({}, ownProps, dataProps);
        },

        options: {
          forceFetch: true,
          notifyOnNetworkStatusChange: true,
        },
      })(Component);
    }
    
    if (!isPlaceholder) {
      const mutationsForComponent =
        this._renderHints.passMutations.get(component.id);
      
      if (mutationsForComponent) {
        mutationsForComponent.forEach(mutationName => {
          // TODO: Wrap in graphql and pass options
        });
      }
    }
  
    //noinspection JSValidateTypes
    return (
      <Renderable {...props} />
    );
  }

  render() {
    if (this.props.rootId > -1) {
      const rootComponent = this.props.components.get(this.props.rootId);
      
      return this._renderComponent(
        rootComponent,
        this.props.isPlaceholder,
        this.props.isPlaceholder,
      );
    } else if (this.props.draggingComponent && !this.props.isPlaceholder) {
      return this._renderPlaceholderForDraggedComponent(-1, -1);
    } else {
      return null;
    }
  }
}

//noinspection JSUnresolvedVariable
BuilderComponent.propTypes = {
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
  draggingOverComponentId: PropTypes.number.isRequired,
  showContentPlaceholders: PropTypes.bool.isRequired,
  selectedComponentIds: PropTypes.object.isRequired, // Immutable.Set<number>
  highlightedComponentIds: PropTypes.object.isRequired, // Immutable.Set<number>
  onNavigate: PropTypes.func,
  onOpenURL: PropTypes.func,
};

BuilderComponent.defaultProps = {
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

BuilderComponent.displayName = 'Builder';

const mapStateToProps = state => ({
  project: state.project.data,
  meta: state.project.meta,
  schema: state.project.schema,
  draggingComponent: state.project.draggingComponent,
  draggedComponentId: state.project.draggedComponentId,
  draggedComponents: state.project.draggedComponents,
  draggingOverComponentId: state.project.draggingOverComponentId,
  showContentPlaceholders: state.app.showContentPlaceholders,
  selectedComponentIds: currentSelectedComponentIdsSelector(state),
  highlightedComponentIds: currentHighlightedComponentIdsSelector(state),
});

const Builder = connect(mapStateToProps)(BuilderComponent);
export default Builder;
