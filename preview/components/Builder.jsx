'use strict';

import React, { Component, PropTypes } from 'react';

// The real components.js will be generated during build process
import components from '../components.js';

import { componentsMap } from '../utils';

/**
 * class Builder
 */
class Builder extends Component {
    /**
     * Build React component by metadata
     * 
     * @param  {Object} data - Scheme for preview app
     * @return {function} React component for render
     */
    getComponentFromMeta(data = null) {
        if (!data) return null;

        if (Array.isArray(data)) {
            if (data.length == 1) {
                if (data[0] == 'outlet') {
                    return this.props.children;
                } else {
                    return this.getComponentFromMeta(data[0])
                }
            } else {
                return data.map(item => this.getComponentFromMeta(item));
            }
        } else {
            const _component = getComponentByName(data['name']);

            let _compositComponent = null;

            if (data['children'] && data['children'].length) {
                _compositComponent = <_component
                    uid={data.uid}
                    {...getProps(data['props'])}
                >
                    { this.getComponentFromMeta(data['children']) }
                </_component>;
            } else {
                _compositComponent = <_component
                    uid={data.uid}
                    {...getProps(data['props'])}
                />
            }

            componentsMap.set(data.uid, {
                'uid': data.uid,
                'name': data.name,
                'componentType': _component.meta ? _component.meta.kind : 'undefined'
            });

            return _compositComponent;
        }
    }

    render() {
        return this.getComponentFromMeta(this.props.data);
    }
}

Builder.propTypes = {
    data: PropTypes.object
};

Builder.defaultProps = {
    data: {}
};

/**
 * Get component from UI library
 * 
 * @param  {string} name - Name of React components
 * @return {function} React component for render
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
 * @param  {Object} props
 * @return {Object}
 */
const getProps = (props = {}) => {
    let externalProps = {};

    for(let key in props) {
        if (props[key].source == 'static') {
            externalProps[key] = props[key].sourceData.value;
        }
    }

    return externalProps;
};

export default Builder;
