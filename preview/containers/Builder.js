'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';

// The real components.js will be generated during build process
import _components from '../components.js';

import { ContentPlaceholder } from '../components/ContentPlaceholder';

import patchComponent from '../patchComponent';

import { getComponentById } from '../../app/models/Project';

import jssyConstants from '../../app/constants/jssyConstants';

import { List, Map } from 'immutable';

import { NO_VALUE } from  '../../app/constants/misc';

import {
    isContainerComponent,
    isCompositeComponent,
    canInsertComponent,
    getComponentMeta,
    parseComponentName,
    isValidSourceForProp
} from '../../app/utils/meta';

import {
    FIELD_KINDS,
    getTypeNameByField,
    getTypeNameByPath
} from '../../app/utils/schema';

import { randomName } from '../../app/utils/graphql';

import {
    objectMap,
    objectForEach,
    clone,
    returnNull
} from '../../app/utils/misc';

const components = objectMap(_components, ns => objectMap(ns, patchComponent));

/**
 *
 * @type {Set<string>}
 * @const
 */
const pseudoComponents = new Set([
    'Text',
    'Outlet',
    'List'
]);

/**
 *
 * @param {ProjectComponent} component
 * @return {boolean}
 */
const isPseudoComponent = component => pseudoComponents.has(component.name);

/**
 * Get component from library
 *
 * @param  {string} componentName - Name of component with namespace (e.g. MyNamespace.MyComponent)
 * @return {Function|string} React component
 */
const getComponentByName = (componentName = '') => {
    const { namespace, name } = parseComponentName(componentName);
    if (!namespace || !name)
        throw new Error(`Invalid component name: '${componentName}'`);

    if (namespace === 'HTML') return name;

    if (!components[namespace])
        throw new Error(`Namespace not found: '${namespace}'`);

    const component = components[namespace][name];
    if (!component)
        throw new Error(`Component not found: '${componentName}'`);

    return component;
};

const toGraphQLScalarValue = (value, type) => {
    if (type === 'String') return { kind: 'StringValue', value };
    if (type === 'Int') return { kind: 'IntValue', value: `${value}` };
    if (type === 'Float') return { kind: 'FloatValue', value: `${value}` };
    if (type === 'Boolean') return { kind: 'BooleanValue', value };
    if (type === 'ID') return { kind: 'StringValue', value }; // ???
    throw new Error('');
};


class BuilderComponent extends PureComponent {
    /**
     *
     * @param {Object} propValue
     * @param {PropTypeDefinition} propMeta
     * @param {Object<string, string>} nextDataContextTree
     * @return {Function}
     */
    _makeBuilderForProp(propValue, propMeta, nextDataContextTree) {
        return props => (
            <Builder
                components={propValue.sourceData.components}
                rootId={propValue.sourceData.rootId}
                dontPatch
                propsFromOwner={props}
                dataContextTree={nextDataContextTree}
                children={props.children}
            />
        );
    }

    /**
     *
     * @param {Object} propValue
     * @param {PropTypeDefinition} propMeta
     * @param {Object} nextDataContextTree
     * @return {*}
     */
    _buildPropValue(propValue, propMeta, nextDataContextTree) {
        if (propValue.source == 'static') {
            if (propValue.sourceData.ownerPropName && !this.props.ignoreOwnerProps) {
                return this.props.propsFromOwner[propValue.sourceData.ownerPropName];
            }
            else {
                if (propMeta.type === 'shape') {
                    if (propValue.sourceData.value === null) return null;

                    return objectMap(propMeta.fields, (fieldMeta, fieldName) => {
                        const fieldValue = propValue.sourceData.value.get(fieldName);

                        return this._buildPropValue(
                            fieldValue,
                            fieldMeta,
                            nextDataContextTree
                        );
                    });
                }
                else if (propMeta.type === 'objectOf') {
                    if (propValue.sourceData.value === null) return null;

                    return propValue.sourceData.value.map(nestedValue =>
                        this._buildPropValue(
                            nestedValue,
                            propMeta.ofType,
                            nextDataContextTree)
                    ).toJS();
                }
                else if (propMeta.type === 'arrayOf') {
                    return propValue.sourceData.value.map(nestedValue =>
                        this._buildPropValue(
                            nestedValue,
                            propMeta.ofType,
                            nextDataContextTree)
                    ).toJS();
                }
                else {
                    return propValue.sourceData.value;
                }
            }
        }
        else if (propValue.source === 'const') {
            if (typeof propValue.sourceData.value !== 'undefined') {
                return propValue.sourceData.value;
            }
            else if (typeof propValue.sourceData.jssyConstId !== 'undefined') {
                return jssyConstants[propValue.sourceData.jssyConstId];
            }
        }
        else if (propValue.source === 'designer') {
            if (propValue.sourceData.components && propValue.sourceData.rootId > -1) {
                return this._makeBuilderForProp(
                    propValue,
                    propMeta,
                    nextDataContextTree
                );
            }
            else {
                return returnNull;
            }
        }
        else if (propValue.source === 'actions') {
            // TODO: Handle actions source
        }

        return NO_VALUE;
    }

    /**
     * Constructs props object
     *
     * @param {Object} component
     * @return {Object<string, *>}
     */
    _buildProps(component) {
        const componentMeta = getComponentMeta(component.name, this.props.meta),
            nextDataContextTree = clone(this.props.dataContextTree);
        
        objectForEach(componentMeta.props, (propMeta, propName) => {
            const hasDataContextDefinition =
                isValidSourceForProp(propMeta, 'data') &&
                propMeta.sourceConfigs.data.pushDataContext;

            if (!hasDataContextDefinition) return;

            const propValue = component.props.get(propName);
            if (propValue && propValue.source === 'data') {
                const dataContext = propMeta.sourceConfigs.data.pushDataContext;

                const dataContextTreeNode = propValue.sourceData.dataContext.reduce(
                    (acc, cur) => acc.children[cur],
                    nextDataContextTree
                );

                const path = propValue.sourceData.queryPath.map(step => step.field);

                dataContextTreeNode.children[dataContext] = {
                    type: getTypeNameByPath(
                        this.props.schema,
                        path,
                        dataContextTreeNode.type
                    ),

                    children: {}
                };
            }
        });

        const ret = {};

        component.props.forEach((propValue, propName) => {
            const propMeta = componentMeta.props[propName];

            const value = this._buildPropValue(
                propValue,
                propMeta,
                nextDataContextTree
            );
            
            if (value !== NO_VALUE) ret[propName] = value;
        });

        return ret;
    };

    /**
     *
     * @param {Object} component
     * @return {*}
     * @private
     */
    _renderPseudoComponent(component) {
        if (component.name === 'Outlet') {
            return this.props.children;
        }
        else if (component.name === 'Text') {
            const props = this._buildProps(component);
            return props.text || '';
        }
        else if (component.name === 'List') {
            const props = this._buildProps(component),
                ItemComponent = props.component;

            return props.data.map((item, idx) => (
                <ItemComponent key={idx} item={item}/>
            ));
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

        const containerComponent = containerId > -1
            ? this.props.components.get(containerId)
            : this.props.enclosingComponentId > -1
                ? getComponentById(
                    this.props.project,
                    this.props.enclosingComponentId
                )
                : null;

        let canDropHere = true;
        if (containerComponent) {
            const containerChildrenNames = containerComponent.children
                .map(id => this.props.components.get(id).name);

            canDropHere = canInsertComponent(
                rootDraggedComponent.name,
                containerComponent.name,
                containerChildrenNames,
                afterIdx + 1,
                this.props.meta
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
                    idx - 1
                ));
                ret.push(this._renderComponent(childComponent, isPlaceholder));
                ret.push(this._renderPlaceholderForDraggedComponent(
                    component.id,
                    idx
                ));
            }
            else {
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
        }
        else {
            props.__jssy_placeholder__ = true;
            props.__jssy_after__ = this.props.afterIdx;
            props.__jssy_container_id__ = this.props.containerId;
        }
    }

    /**
     *
     * @param {Object} component
     * @param {boolean} [isPlaceholder=false]
     * @param {boolean} [isPlaceholderRoot=false]
     * @return {ReactElement}
     * @private
     */
    _renderComponent(component, isPlaceholder = false, isPlaceholderRoot = false) {
        // Do not render component that's being dragged right now
        if (component.id === this.props.draggedComponentId && !isPlaceholder) return null;

        // Handle special components like Text, Outlet etc.
        if (isPseudoComponent(component)) return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name),
            props = this._buildProps(component),
            isHTMLComponent = typeof Component === 'string';

        props.children = this._renderComponentChildren(component, isPlaceholder);

        if (!isPlaceholder) {
            props.key = component.id;

            if (!this.props.dontPatch)
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
                        -1
                    );
                }
            }
            else if (this.props.showContentPlaceholders) {
                // Content placeholders are enabled
                const willRenderContentPlaceholder =
                    !props.children &&
                    isContainerComponent(component.name, this.props.meta);

                if (willRenderContentPlaceholder)
                    props.children = <ContentPlaceholder />;
            }
        }
        else {
            props.key = 'placeholder-' + String(Math.floor(Math.random() * 1000000000));

            if (isPlaceholderRoot && !this.props.dontPatch)
                this._patchPlaceholderRootProps(props, isHTMLComponent);

            const willRenderContentPlaceholder =
                !props.children &&
                isContainerComponent(component.name, this.props.meta);

            // Render fake content inside placeholders for container components
            if (willRenderContentPlaceholder)
                props.children = <ContentPlaceholder />;
        }

        //noinspection JSValidateTypes
        return (
            <Component {...props} />
        );
    }

    render() {
        if (this.props.rootId > -1) {
            const rootComponent = this.props.components.get(this.props.rootId);

            // Render as usual
            return this._renderComponent(
                rootComponent,
                this.props.isPlaceholder,
                this.props.isPlaceholder
            );
        }
        else if (this.props.draggingComponent && !this.props.isPlaceholder) {
            return this._renderPlaceholderForDraggedComponent(-1, -1);
        }
        else {
            return null;
        }
    }
}

BuilderComponent.propTypes = {
    components: PropTypes.object, // Immutable.Map<number, Component>
    rootId: PropTypes.number,
    dontPatch: PropTypes.bool,
    enclosingComponentId: PropTypes.number,
    isPlaceholder: PropTypes.bool,
    afterIdx: PropTypes.number,
    containerId: PropTypes.number,
    propsFromOwner: PropTypes.object,
    ignoreOwnerProps: PropTypes.bool,
    dataContextTree: PropTypes.object,

    project: PropTypes.any,
    meta: PropTypes.object,
    schema: PropTypes.object,
    draggingComponent: PropTypes.bool,
    draggedComponentId: PropTypes.number,
    draggedComponents: PropTypes.any,
    draggingOverComponentId: PropTypes.number,
    showContentPlaceholders: PropTypes.bool
};

BuilderComponent.defaultProps = {
    components: null,
    rootId: -1,
    dontPatch: false,
    enclosingComponentId: -1,
    isPlaceholder: false,
    afterIdx: -1,
    containerId: -1,
    propsFromOwner: {},
    ignoreOwnerProps: false,
    dataContextTree: null
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
    showContentPlaceholders: state.app.showContentPlaceholders
});

const Builder = connect(mapStateToProps)(BuilderComponent);
export default Builder;
