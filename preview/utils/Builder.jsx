'use strict';

import React, { Component, PropTypes } from 'react';

// The real components.js will be generated during build process
import components from '../components.js';

import * as actions from './actions.js';

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
        if(data) {
            if(Array.isArray(data)) {
                if(data.length == 1) {
                    if(data[0] == 'outlet') {
                        return this.props.children;
                    } else {
                        return this.getComponentFromMeta(data[0])
                    }
                } else {
                    return data.map((item) => {
                        return this.getComponentFromMeta(item);
                    });
                }
            } else {
                const _component = getComponentByName(data['name']);

                if(data['children'].length) {
                    return <_component {...getProps(data['props'])}>
                        { this.getComponentFromMeta(data['children']) }
                    </_component>;
                } else {
                    return <_component {...getProps(data['props'])} />
                }
            }
        } else {
            return null;
        }
    }

    render() {
        console.log(this.props.data);
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
    if (!namespace || !componentName) throw new Error(`Wrong component name: ${name}`);
    const component = components[namespace][componentName];
    if (!component) throw new Error(`Component not found: ${name}`);
    return component;
};

/**
 * Props constructor by meta
 * @param  {Object} props
 * @return {Object}
 */
const getProps = (data = {}) => {
    let externalProps = {},
        internalProps = {},
        props = data.props;

    if(props && props.source == 'static') {
        externalProps = props.sourceData.SourceDataStatic;
    }

    internalProps = {
        onClick: actions.get(this, 'click', 'xxx'),
        onMouseOut: actions.get(this, 'mouseout', 'xxx'),
        onMouseOver: actions.get(this, 'mouseover', 'xxx'),
        onChange: actions.get(this, 'change', 'xxx')
    }

    return externalProps;
}

export default Builder;
