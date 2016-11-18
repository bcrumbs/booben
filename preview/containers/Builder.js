'use strict';

//noinspection JSUnresolvedVariable
import React, { PureComponent, PropTypes } from 'react';
import { connect } from 'react-redux';

// The real components.js will be generated during build process
import _components from '../components.js';

import { ContentPlaceholder } from '../components/ContentPlaceholder';

import patchComponent from '../patchComponent';

import { getComponentById } from '../../app/models/Project';

import jssyConstants from '../../app/constants/jssyConstants';

import { List, Map } from 'immutable';

import {
    isContainerComponent,
    isCompositeComponent,
    canInsertComponent
} from '../../app/utils/meta';

import {
    objectMap,
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
    'Outlet'
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
 * @param  {string} name - Name of component with namespace (e.g. MyNamespace.MyComponent)
 * @return {Function|string} React component
 */
const getComponentByName = (name = '') => {
    const [namespace, componentName] = name.split('.');
    if (!namespace || !componentName) throw new Error(`Invalid component name: ${name}`);
    if (namespace === 'HTML') return componentName;
    if (!components[namespace]) throw new Error(`Namespace not found: ${namespace}`);
    const component = components[namespace][componentName];
    if (!component) throw new Error(`Component not found: ${name}`);
    return component;
};

/**
 *
 * @param {Object} propValueDescriptor
 * @param {string} propName
 * @return {Function}
 */
const makeBuilderForProp = (propValueDescriptor, propName) => {
    // TODO: Memoize
    const ret = props => (
        <Builder
            components={propValueDescriptor.sourceData.components}
            rootId={propValueDescriptor.sourceData.rootId}
            dontPatch
            propsFromOwner={props}
            children={props.children}
        />
    );

    ret.displayName = `Builder(${propName})`;

    return ret;
};

const NO_VALUE = (() => {
    function NO_VALUE() {}
    NO_VALUE.prototype = Object.create(null);
    return new NO_VALUE();
})();

/**
 *
 * @param {Object} prop
 * @param {?Object<string, *>} propsFromOwner
 * @return {*}
 */
const buildPropValue = (prop, propsFromOwner) => {
    if (prop.source == 'static') {
        if (propsFromOwner && prop.sourceData.ownerPropName) {
            return propsFromOwner[prop.sourceData.ownerPropName];
        }
        else {
            if (List.isList(prop.sourceData.value)) {
                return prop.sourceData.value.map(nestedProp =>
                    buildPropValue(nestedProp, propsFromOwner)).toJS();
            }
            else if (Map.isMap(prop.sourceData.value)) {
                return prop.sourceData.value.map(nestedProp =>
                    buildPropValue(nestedProp, propsFromOwner)).toJS();
            }
            else {
                return prop.sourceData.value;
            }
        }
    }
    else if (prop.source === 'const') {
        if (typeof prop.sourceData.value !== 'undefined') {
            return prop.sourceData.value;
        }
        else if (typeof prop.sourceData.jssyConstId !== 'undefined') {
            return jssyConstants[prop.sourceData.jssyConstId];
        }
    }
    else if (prop.source === 'designer') {
        if (prop.sourceData.components && prop.sourceData.rootId > -1) {
            return makeBuilderForProp(prop, key);
        }
        else {
            return returnNull;
        }
    }
    else if (prop.source === 'actions') {
        // TODO: Handle actions source
    }
    else if (prop.source === 'data') {
        // TODO: Handle data source
    }

    return NO_VALUE;
};

/**
 * Constructs props object
 *
 * @param {Immutable.Map<string, Object>} propValueDescriptors
 * @param {?Object<string, *>} propsFromOwner
 * @return {Object<string, *>}
 */
const buildProps = (propValueDescriptors, propsFromOwner) => {
    const ret = {};

    propValueDescriptors.forEach((prop, key) => {
        const value = buildPropValue(prop, propsFromOwner);
        if (value !== NO_VALUE) ret[key] = value;
    });

    return ret;
};

class BuilderComponent extends PureComponent {
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
            const propsFromOwner = this.props.ignoreOwnerProps
                ? null
                : this.props.propsFromOwner;

            const props = buildProps(component.props, propsFromOwner);
            return props.text || '';
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

        const Component = getComponentByName(component.name);

        const propsFromOwner = this.props.ignoreOwnerProps
            ? null
            : this.props.propsFromOwner;

        const props = buildProps(component.props, propsFromOwner),
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
    components: PropTypes.any, // Immutable map of <number, Component>
    rootId: PropTypes.number,
    dontPatch: PropTypes.bool,
    enclosingComponentId: PropTypes.number,
    isPlaceholder: PropTypes.bool,
    afterIdx: PropTypes.any, // number on null
    containerId: PropTypes.any, // number on null
    propsFromOwner: PropTypes.object,
    ignoreOwnerProps: PropTypes.bool,

    project: PropTypes.any,
    meta: PropTypes.object,
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
    ignoreOwnerProps: false
};

BuilderComponent.displayName = 'Builder';

const mapStateToProps = state => ({
    project: state.project.data,
    meta: state.project.meta,
    draggingComponent: state.project.draggingComponent,
    draggedComponentId: state.project.draggedComponentId,
    draggedComponents: state.project.draggedComponents,
    draggingOverComponentId: state.project.draggingOverComponentId,
    showContentPlaceholders: state.app.showContentPlaceholders
});

const Builder = connect(mapStateToProps)(BuilderComponent);
export default Builder;
