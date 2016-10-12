'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { connect } from 'react-redux';
import { Map } from 'immutable';

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
    constructor(props) {
        super(props);

        this._renderComponent = this._renderComponent.bind(this);
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

    _renderComponent(component) {
        if (!component) return null;
        if (component.id === this.props.draggedComponentId) return null;

        if (isPseudoComponent(component))
            return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name);

        let children = null;

        if (component.children.size > 0)
            children = component.children.map(this._renderComponent);

        const props = getProps(component.props);
        props.key = component.id;
        props.children = children;


        if (typeof Component === 'string') {
            props['data-jssy-id'] = component.id;
        }
        else {
            props.__jssy_component_id__ = component.id;
        }

        return (
            <Component {...props} />
        );
    }

    render() {
        return this._renderComponent(this.props.component);
    }
}

Builder.propTypes = {
    component: ImmutablePropTypes.contains({
        id: React.PropTypes.number,
        name: React.PropTypes.string,
        props: ImmutablePropTypes.map,
        children: ImmutablePropTypes.list
    }),

    draggedComponentId: PropTypes.any // number or null
};

Builder.defaultProps = {
    component: null
};

Builder.displayName = 'Builder';

const mapStateToProps = state => ({
    draggedComponentId: state.preview.draggedComponentId
});

export default connect(mapStateToProps)(Builder);
