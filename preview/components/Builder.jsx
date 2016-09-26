'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';

// The real components.js will be generated during build process
import components from '../components.js';

import { componentsMap } from '../utils';
import { ProjectComponent } from '../../app/models';

const pseudoComponents = new Set([
    'Text',
    'Outlet'
]);

const isPseudoComponent = component => pseudoComponents.has(component.name);

class Builder extends Component {
    constructor(props) {
        super(props);

        this._getComponentFromMeta = this._getComponentFromMeta.bind(this);
    }
    
    shouldComponentUpdate(nextProps) {
      return nextProps.component !== this.props.component;
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

    _getComponentFromMeta(component = null) {
        if (!component) return null;
        
        if (isPseudoComponent(component))
            return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name);

        componentsMap.set(component.uid, {
            name: component.name,
            componentType: Component.jssy ? Component.jssy.kind : null
        });

        if (component.children && component.children.size) {
            return (
                <Component
                    key={component.uid}
                    uid={component.uid}
                    {...getProps(component.props)}
                >
                    { component.children.map(this._getComponentFromMeta) }
                </Component>
            );
        }
        else {
            return (
                <Component
                    key={component.uid}
                    uid={component.uid}
                    {...getProps(component.props)}
                />
            );
        }
    }

    render() {
        return this._getComponentFromMeta(this.props.component);
    }
}

Builder.propTypes = {
    component: PropTypes.instanceOf(ProjectComponent)
};

Builder.defaultProps = {
    component: null
};

/**
 * Get component from UI library
 * 
 * @param  {string} name - Name of React component
 * @return {Function} React component for render
 */
const getComponentByName = (name = '') => {
    const [namespace, componentName] = name.split('.');
    if (!namespace || !componentName) throw new Error(`Invalid component name: ${name}`);
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

export default Builder;
