/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { isReactComponent, toClassComponent } from '../../../../utils/react';

import {
  noop,
  isNullOrUndef,
  isNumber,
  isFunction,
} from '../../../../utils/misc';

const patchDOMElement = componentInstance => {
  const {
    __jssy_component_id__: componentId,
    __jssy_placeholder__: isPlaceholder,
    __jssy_container_id__: containerId,
    __jssy_after__: after,
  } = componentInstance.props;

  if (isNumber(componentId)) {
    const element = findDOMNode(componentInstance);
    if (element) element.setAttribute('data-jssy-id', String(componentId));
  } else if (isPlaceholder) {
    const element = findDOMNode(componentInstance);

    if (element) {
      element.setAttribute('data-jssy-placeholder', '');
      element.setAttribute('data-jssy-after', String(after));
      element.setAttribute('data-jssy-container-id', String(containerId));
    }
  }
};

const wrapLifecycleHook = fn => function (...args) {
  fn.apply(this, args);
  patchDOMElement(this);
};

const defaultReturnValues = {
  render: null,
  shouldComponentUpdate: false,
};

const catchErrors = (fn, hookName) => function (...args) {
  try {
    return fn.apply(this, args);
  } catch (error) {
    if (isFunction(this.props.__jssy_error_handler__))
      this.props.__jssy_error_handler__(error, hookName);
    
    return defaultReturnValues[hookName];
  }
};

const catchErrorsInLifecycleHook = (component, hookName) => {
  const originalHook = component.prototype[hookName];
  
  if (originalHook)
    component.prototype[hookName] = catchErrors(originalHook, hookName);
};

const reactLifecycleHooks = [
  'componentWillMount',
  'componentDidMount',
  'componentWillReceiveProps',
  'shouldComponentUpdate',
  'componentWillUpdate',
  'componentDidUpdate',
  'componentWillUnmount',
  'render',
];

const patchClassComponent = component => {
  reactLifecycleHooks.forEach(hookName => {
    catchErrorsInLifecycleHook(component, hookName);
  });
  
  const originalComponentDidMount =
    component.prototype.componentDidMount || noop;
  const originalComponentDidUpdate =
    component.prototype.componentDidUpdate || noop;

  component.prototype.componentDidMount =
    wrapLifecycleHook(originalComponentDidMount);

  component.prototype.componentDidUpdate =
    wrapLifecycleHook(originalComponentDidUpdate);
  
  if (component.propTypes)
    component.propTypes.__jssy_error_handler__ = PropTypes.func;
  
  if (component.defaultProps)
    component.defaultProps.__jssy_error_handler__ = noop;

  return component;
};

/**
 *
 * @param {*} component
 * @return {*}
 */
export default component => {
  if (isNullOrUndef(component)) return component;

  if (isReactComponent(component))
    return patchClassComponent(toClassComponent(component));

  return component;
};
