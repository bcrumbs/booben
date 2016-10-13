'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Map, List } from 'immutable';

// The real components.js will be generated during build process
import _components from '../components.js';
import patchComponent from '../patchComponent';

const components = {};

Object.keys(_components).forEach(namespace => {
    Object.keys(_components[namespace]).forEach(componentName => {
        if (!components[namespace])
            components[namespace] = {};

        components[namespace][componentName] =
            patchComponent(_components[namespace][componentName]);
    });
});

const pseudoComponents = new Set([
    'Text',
    'Outlet'
]);

const isPseudoComponent = component => pseudoComponents.has(component.name);

/**
 * Get component from UI library
 *
 * @param  {string} name - Name of React component
 * @return {Function} React component for render
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
 * Props constructor by meta
 * @param  {Immutable.Map} props
 * @return {Object}
 */
const getProps = props => {
    const ret = {};

    props.keySeq().forEach(key => {
        const prop = props.get(key);

        if (prop.source == 'static') {
            ret[key] = prop.sourceData.value;
        }
        else if (prop.source === 'const') {
            if (typeof prop.sourceData.value !== 'undefined') {
                ret[key] = prop.sourceData.value;
            }
        }
    });

    return ret;
};

class Builder extends Component {
    componentDidMount() {
        if (this.props.isPlaceholder) this._makeTransparent();
    }

    componentDidUpdate() {
        if (this.props.isPlaceholder) this._makeTransparent();
    }

    _makeTransparent() {
        const el = ReactDOM.findDOMNode(this);
        if (el) el.style.opacity = '.25';
    }

    _isDraggedComponent(component) {
        return component === this.props.draggedComponent;
    }

    _renderPseudoComponent(component) {
        if (component.name === 'Outlet') {
            return this.props.children;
        }
        else if (component.name === 'Text') {
            const props = getProps(component.props);
            return props.text || '';
        }
    }

    _renderComponent(component, isPlaceholder = false, isPlaceholderRoot = false) {
        if (!component) return null;
        if (!isPlaceholder && this._isDraggedComponent(component)) return null;

        if (isPseudoComponent(component))
            return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name);

        let children = null;

        if (component.children.size > 0) {
            const needPlaceholders =
                this.props.draggedComponent !== null &&
                this.props.draggingOverComponentId !== null;

            if (needPlaceholders) {
                children = List().withMutations(list => {
                    component.children.forEach((childComponent, idx) => {
                        if (childComponent.id === this.props.draggingOverComponentId) {
                            list.push(
                                <Builder
                                    component={this.props.draggedComponent}
                                    isPlaceholder
                                    afterIdx={idx - 1}
                                />
                            );

                            list.push(
                                this._renderComponent(childComponent, isPlaceholder)
                            );

                            list.push(
                                <Builder
                                    component={this.props.draggedComponent}
                                    isPlaceholder
                                    afterIdx={idx}
                                />
                            );
                        }
                        else {
                            list.push(
                                this._renderComponent(childComponent, isPlaceholder)
                            );
                        }
                    });
                });
            }
            else {
                children = component.children.map(
                    childComponent => this._renderComponent(childComponent, isPlaceholder)
                );
            }
        }

        const props = getProps(component.props);
        props.key = component.id;
        props.children = children;

        if (!props.children && this.props.draggedComponent !== null) {
            props.children = (
                <Builder
                    component={this.props.draggedComponent}
                    isPlaceholder
                    afterIdx={-1}
                />
            );
        }

        if (!isPlaceholder) {
            if (typeof Component === 'string') props['data-jssy-id'] = component.id;
            else props.__jssy_component_id__ = component.id;
        }
        else if (isPlaceholderRoot) {
            if (typeof Component === 'string') {
                props['data-jssy-placeholder'] = true;
                props['data-jssy-after'] = this.props.afterIdx
            }
            else {
                props.__jssy_placeholder__ = true;
                props.__jssy_after__ = this.props.afterIdx;
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
    draggedComponent: PropTypes.any,
    draggingOverComponentId: PropTypes.any // number or null
};

Builder.defaultProps = {
    component: null,
    isPlaceholder: false,
    afterIdx: null
};

Builder.displayName = 'Builder';

const mapStateToProps = state => ({
    draggedComponent: state.preview.draggedComponent,
    draggingOverComponentId: state.preview.draggingOverComponentId
});

export default connect(mapStateToProps)(Builder);
