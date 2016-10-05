'use strict';

//noinspection JSUnresolvedVariable
import React, { Component, PropTypes } from 'react';
import ImmutablePropTypes from 'react-immutable-proptypes';
import { Map } from 'immutable';
import { connect } from 'react-redux';

// The real components.js will be generated during build process
import components from '../components.js';

import {
    setComponentToMap
} from '../../app/actions/preview';

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

    _renderPseudoComponent(component) {
        if (component.name === 'Outlet') {
            return this.props.children;
        }
        else if (component.name === 'Text') {
            const props = getProps(component.props);
            return props.text || '';
        }
    }

    _getComponentFromMeta(component = null, componentIndex = []) {
        if (!component) return null;

        if (isPseudoComponent(component))
            return this._renderPseudoComponent(component);

        const Component = getComponentByName(component.name);

        let baseIndex = [...this.props.routeIndex, 'component'];

        if(componentIndex) {
            baseIndex = [...baseIndex, ...componentIndex];
        }

        if(!this.props.componentsMap.has(component.uid)) {
            this.props.setComponentToMap(component.uid, {
                name: component.name,
                componentType: Component.jssy ? Component.jssy.kind : null,
                where: [...baseIndex]
            });
        }
        

        if (component.children && component.children.size) {
            return (
                <Component
                    key={component.uid}
                    uid={component.uid}
                    {...getProps(component.props)}
                >
                    { component.children.map((_component, index) => 
                        this._getComponentFromMeta(_component, 
                            [].concat(...componentIndex, 'children', index))) }
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
    component: ImmutablePropTypes.contains({
        uid: React.PropTypes.string,
        name: React.PropTypes.string,
        props: ImmutablePropTypes.map,
        children: ImmutablePropTypes.list
    }),
    routeIndex: React.PropTypes.array,
    componentsMap: ImmutablePropTypes.map
};

Builder.defaultProps = {
    component: null,
    routeIndex: [],
    componentsMap: Map()
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

const mapDispatchToProps = dispatch => ({
    setComponentToMap: (uid, component) => void dispatch(setComponentToMap(
        uid, component))
});

const mapStateToProps = state => ({
    componentsMap: state.preview.componentsMap
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Builder);
