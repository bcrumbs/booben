'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';

// The real components.js will be generated during build process
import _components from '../components.js';

import patchComponent from '../patchComponent';
import { isContainerComponent, isCompositeComponent } from '../../app/utils/meta';
import { objectMap } from '../../app/utils/misc';

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
 * Constructs props object
 *
 * @param  {Immutable.Map<string, ProjectComponentProp>} props
 * @return {Object<string, *>}
 */
const buildProps = props => {
    const ret = {};

    props.forEach((prop, key) => {
        if (prop.source == 'static') {
            ret[key] = prop.sourceData.value;
        }
        else if (prop.source === 'const') {
            if (typeof prop.sourceData.value !== 'undefined')
                ret[key] = prop.sourceData.value;
        }
    });

    return ret;
};

class BuilderComponent extends Component {
    /**
     *
     * @param {ProjectComponent} component
     * @return {*}
     * @private
     */
    _renderPseudoComponent(component) {
        if (component.name === 'Outlet') {
            return this.props.children;
        }
        else if (component.name === 'Text') {
            const props = buildProps(component.props);
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
        //noinspection JSValidateTypes
        return (
            <Builder
                component={this.props.draggedComponent}
                isPlaceholder
                afterIdx={afterIdx}
                containerId={containerId}
            />
        );
    }

    /**
     *
     * @return {ReactElement}
     * @private
     */
    _renderContentPlaceholder() {
        // TODO: Replace this shit with actual placeholder
        const style = {
            width: '100%',
            height: '100%',
            minHeight: '20px',
            backgroundColor: '#555555',
            opacity: '.5'
        };

        //noinspection JSValidateTypes
        return (
            <div style={style} />
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

        component.children.forEach((childComponent, idx) => {
            // Do not render disabled regions in composite components
            if (!isPlaceholder && isComposite && !component.regionsEnabled.has(idx))
                return;

            const needPlaceholders =
                !isPlaceholder &&
                this.props.draggedComponent !== null &&
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
     * @param {ProjectComponent} component
     * @param {boolean} [isPlaceholder=false]
     * @param {boolean} [isPlaceholderRoot=false]
     * @return {ReactElement}
     * @private
     */
    _renderComponent(component, isPlaceholder = false, isPlaceholderRoot = false) {
        if (!component) return null;

        // Do not render component that's being dragged right now
        if (component === this.props.draggedComponent && !isPlaceholder) return null;

        // Handle special components like Text, Outlet etc.
        if (isPseudoComponent(component)) return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name),
            props = buildProps(component.props),
            isHTMLComponent = typeof Component === 'string';

        props.children = this._renderComponentChildren(component, isPlaceholder);

        if (!isPlaceholder) {
            props.key = component.id;
            this._patchComponentProps(props, isHTMLComponent, component.id);

            const willRenderPlaceholderInside =
                this.props.draggedComponent !== null &&
                !props.children &&
                isContainerComponent(component.name, this.props.meta);

            // Render placeholders inside empty containers when user is dragging something
            if (willRenderPlaceholderInside) {
                props.children = this._renderPlaceholderForDraggedComponent(
                    component.id,
                    -1
                );
            }
        }
        else {
            const isNewComponentPlaceholder = component.id === null;

            props.key = isNewComponentPlaceholder
                ? Math.floor(Math.random() * 1000000) + 1000000
                : component.id;

            if (isPlaceholderRoot)
                this._patchPlaceholderRootProps(props, isHTMLComponent);

            const willRenderContentPlaceholder =
                isNewComponentPlaceholder &&
                !props.children &&
                isContainerComponent(component.name, this.props.meta);

            // Render fake content inside placeholders for container components
            if (willRenderContentPlaceholder)
                props.children = this._renderContentPlaceholder();
        }

        //noinspection JSValidateTypes
        return (
            <Component {...props} />
        );
    }

    render() {
        if (!this.props.component && this.props.draggedComponent) {
            // Render placeholder for root component that is being dragged
            return this._renderPlaceholderForDraggedComponent(-1, -1);
        }
        else {
            // Render as usual
            return this._renderComponent(
                this.props.component,
                this.props.isPlaceholder,
                this.props.isPlaceholder
            );
        }
    }
}

BuilderComponent.propTypes = {
    component: ImmutablePropTypes.contains({
        id: React.PropTypes.number,
        name: React.PropTypes.string,
        props: ImmutablePropTypes.map,
        children: ImmutablePropTypes.list
    }),

    isPlaceholder: PropTypes.bool,
    afterIdx: PropTypes.any, // number on null
    containerId: PropTypes.any, // number on null

    meta: PropTypes.object,
    draggedComponent: PropTypes.any,
    draggingOverComponentId: PropTypes.any // number or null
};

BuilderComponent.defaultProps = {
    component: null,
    isPlaceholder: false,
    afterIdx: null,
    containerId: null
};

BuilderComponent.displayName = 'Builder';

const mapStateToProps = state => ({
    meta: state.project.meta,
    draggedComponent: state.project.draggedComponent,
    draggingOverComponentId: state.project.draggingOverComponentId
});

const Builder = connect(mapStateToProps)(BuilderComponent);
export default Builder;
