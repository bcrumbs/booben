/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import { noop } from '../../app/utils/misc';

const patchDOMElement = componentInstance => {
  const componentId = componentInstance.props.__jssy_component_id__;

  if (typeof componentId === 'number') {
    const el = ReactDOM.findDOMNode(componentInstance);
    if (el) el.setAttribute('data-jssy-id', String(componentId));
  } else {
    const isPlaceholder = componentInstance.props.__jssy_placeholder__;

    if (isPlaceholder) {
      const el = ReactDOM.findDOMNode(componentInstance);
      if (el) {
        const after = componentInstance.props.__jssy_after__,
          containerId = componentInstance.props.__jssy_container_id__;

        el.setAttribute('data-jssy-placeholder', '');
        el.setAttribute('data-jssy-after', String(after));
        el.setAttribute('data-jssy-container-id', String(containerId));
      }
    }
  }
};

const wrapLifecycleHook = fn => function (...args) {
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

const patchFunctionComponent = component => {
  const ret = class extends React.Component {
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

  if (typeof component.propTypes !== 'undefined')
    ret.propTypes = component.propTypes;

  if (typeof component.defaultProps !== 'undefined')
    ret.defaultProps = component.defaultProps;

  if (typeof component.displayName !== 'undefined')
    ret.displayName = component.displayName;

  return ret;
};

/**
 *
 * @param {*} val
 * @return {boolean}
 */
const isNullOrUndefined = val => typeof val === 'undefined' || val === null;

/**
 *
 * @param {*} component
 * @return {*}
 */
export default component => {
  if (isNullOrUndefined(component)) return component;

  if (component.prototype && component.prototype.isReactComponent)
    return patchClassComponent(component);

  if (typeof component === 'function')
    return patchFunctionComponent(component);

  return component;
};
