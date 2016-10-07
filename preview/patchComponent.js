/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import { noop } from '../app/utils/misc';

const patchDOMElement = componentInstance => {
    const el = ReactDOM.findDOMNode(componentInstance);

    if (el) el.setAttribute(
        'data-jssy-id',
        componentInstance.props.__jssy_component_id__
    );
};

const wrapLifecycleHook = fn => function(...args) {
    patchDOMElement(this);
    return fn.apply(this, args);
};

const patchClassComponent = component => {
    const originalComponentDidMount = component.prototype.componentDidMount || noop,
        originalComponentDidUpdate = component.prototype.componentDidUpdate || noop;

    component.prototype.componentDidMount =
        wrapLifecycleHook(originalComponentDidMount);

    component.prototype.componentDidUpdate =
        wrapLifecycleHook(originalComponentDidUpdate);

    return component;
};

const patchFunctionComponent = component => class extends React.Component {
    componentDidMount() {
        patchDOMElement(this);
    }

    componentDidUpdate() {
        patchDOMElement(this);
    }

    render() {
        return component(this.props);
    }
};

const isNullOrUndefined = val => typeof val === 'undefined' || val === null;

export default component => {
    if (isNullOrUndefined(component)) return component;

    if (component.prototype && component.prototype.isReactComponent)
        return patchClassComponent(component);

    if (typeof component === 'function')
        return patchFunctionComponent(component);

    return component;
}
