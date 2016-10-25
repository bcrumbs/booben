'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';

// The real components.js will be generated during build process
import _components from '../components.js';
import patchComponent from '../patchComponent';
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
const getProps = props => {
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

class Builder extends Component {
    /**
     *
     * @param {ProjectComponent} component
     * @return {boolean}
     * @private
     */
    _isDraggedComponent(component) {
        return component === this.props.draggedComponent;
    }

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
            const props = getProps(component.props);
            return props.text || '';
        }
    }

    /**
     *
     * @param {ProjectComponent} component
     * @param {boolean} [isPlaceholder=false]
     * @return {?Immutable.List<ReactElement>}
     * @private
     */
    _renderComponentChildren(component, isPlaceholder = false) {
        if (component.children.size === 0) return null;

        const needPlaceholders =
            this.props.draggedComponent !== null &&
            this.props.draggingOverComponentId !== null;

        if (!needPlaceholders) {
            //noinspection JSValidateTypes
            return component.children.map(childComponent =>
                this._renderComponent(childComponent, isPlaceholder));
        }

        return List().withMutations(list => {
            component.children.forEach((childComponent, idx) => {
                if (childComponent.id === this.props.draggingOverComponentId) {
                    list.push(
                        <Builder
                            component={this.props.draggedComponent}
                            isPlaceholder
                            afterIdx={idx - 1}
                            containerId={component.id}
                        />
                    );

                    list.push(this._renderComponent(childComponent, isPlaceholder));

                    list.push(
                        <Builder
                            component={this.props.draggedComponent}
                            isPlaceholder
                            afterIdx={idx}
                            containerId={component.id}
                        />
                    );
                }
                else {
                    list.push(this._renderComponent(childComponent, isPlaceholder));
                }
            });
        });
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
        if (!isPlaceholder && this._isDraggedComponent(component)) return null;

        if (isPseudoComponent(component))
            return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name),
            props = getProps(component.props);

        props.key = component.id;
        props.children = this._renderComponentChildren(component, isPlaceholder);

        if (!props.children && this.props.draggedComponent !== null) {
            props.children = (
                <Builder
                    component={this.props.draggedComponent}
                    isPlaceholder
                    afterIdx={-1}
                    containerId={component.id}
                />
            );
        }

        if (!isPlaceholder) {
            if (typeof Component === 'string') props['data-jssy-id'] = component.id;
            else props.__jssy_component_id__ = component.id;
        }
        else if (isPlaceholderRoot) {
            if (typeof Component === 'string') {
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

        return (
            <Component {...props} />
        );
    }

    render() {
        return this._renderComponent(
            this.props.component,
            this.props.isPlaceholder,
            true
        );
    }
}

Builder.propTypes = {
    component: ImmutablePropTypes.contains({
        id: React.PropTypes.number,
        name: React.PropTypes.string,
        props: ImmutablePropTypes.map,
        children: ImmutablePropTypes.list
    }),

    isPlaceholder: PropTypes.bool,
    afterIdx: PropTypes.any, // number on null
    containerId: PropTypes.any, // number on null

    draggedComponent: PropTypes.any,
    draggingOverComponentId: PropTypes.any // number or null
};

Builder.defaultProps = {
    component: null,
    isPlaceholder: false,
    afterIdx: null,
    containerId: null
};

Builder.displayName = 'Builder';

const mapStateToProps = state => ({
    draggedComponent: state.preview.draggedComponent,
    draggingOverComponentId: state.preview.draggingOverComponentId
});

export default connect(mapStateToProps)(Builder);
