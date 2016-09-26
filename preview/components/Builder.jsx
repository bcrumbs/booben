'use strict';

import React, { Component, PropTypes } from 'react';
import { List, Map } from 'immutable';

// The real components.js will be generated during build process
import components from '../components.js';

import { componentsMap } from '../utils';
import { ProjectComponent } from '../../app/models';
/**
 * class Builder
 */
class Builder extends Component {
    shouldComponentUpdate(nextProps, nextState) {
      return nextProps.component !== this.props.component;
    }
    /**
     * Build React component
     * 
     * @param  {Object} component - Scheme for preview app
     * @return {function} React component for render
     */
    getComponentFromMeta(component = null) {
        if (!component) return null;

        if (List.isList(component)) {
            if (component.size == 1) {
                if (component.first().name == 'Outlet') {
                    return this.props.children;
                } else {
                    return this.getComponentFromMeta(component.first())
                }
            } else {
                return component.map(item => this.getComponentFromMeta(item));
            }
        } else {
            const _component = getComponentByName(component.name);

            let _compositComponent = null;

            if (component.children && component.children.size) {
                _compositComponent = <_component
                    key={component.uid}
                    uid={component.uid}
                    {...getProps(component.props)}
                >
                    { this.getComponentFromMeta(component.children) }
                </_component>;
            } else {
                _compositComponent = <_component
                    key={component.uid}
                    uid={component.uid}
                    {...getProps(component.props)}
                />
            }

            componentsMap.set(component.uid, {
                'name': component.name,
                'componentType': _component.meta ? _component.meta.kind : 'undefined'
            });

            return _compositComponent;
        }
    }

    render() {
        return this.getComponentFromMeta(this.props.component);
    }
}

Builder.propTypes = {
    component: PropTypes.instanceOf(ProjectComponent)
};

Builder.defaultProps = {
    component: new ProjectComponent()
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

    props.keySeq().forEach((key) => {
        const prop = props.get(key);

        if (prop.source == 'static') {
            externalProps[key] = prop.sourceData.value;
        }
    });

    return externalProps;
};

export default Builder;
