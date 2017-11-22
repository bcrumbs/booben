/**
 * @author Dmitriy Bizyaev
 */

import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { isReactComponent, toClassComponent } from '../utils/react';

import {
  noop,
  isNullOrUndef,
  isNumber,
  isFunction,
} from '../utils/misc';

const patchDOMElement = componentInstance => {
  const {
    __jssy_component_id__: componentId,
    __jssy_placeholder__: isPlaceholder,
    __jssy_container_id__: containerId,
    __jssy_after__: after,
    __jssy_invisible__: invisible,
  } = componentInstance.props;

  const node = findDOMNode(componentInstance);

  if (!node) return;

  node.addEventListener('keypress', e => e.preventDefault());
  node.addEventListener('click', e => e.preventDefault());
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (isNumber(componentId)) {
      node.setAttribute('data-jssy-id', String(componentId));
    } else if (isPlaceholder) {
      node.setAttribute('data-jssy-placeholder', '');
      node.setAttribute('data-jssy-after', String(after));
      node.setAttribute('data-jssy-container-id', String(containerId));
    }

    if (invisible) {
      node.setAttribute('data-jssy-invisible', '');
    } else {
      node.removeAttribute('data-jssy-invisible');
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
    if (isFunction(this.props.__jssy_error_handler__)) {
      this.props.__jssy_error_handler__(error, hookName);
    }
    
    return defaultReturnValues[hookName];
  }
};

const catchErrorsInLifecycleHook = (component, hookName) => {
  const originalHook = component.prototype[hookName];
  
  if (originalHook) {
    component.prototype[hookName] = catchErrors(originalHook, hookName);
  }
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
  
  if (component.propTypes) {
    component.propTypes.__jssy_error_handler__ = PropTypes.func;
  }
  
  if (component.defaultProps) {
    component.defaultProps.__jssy_error_handler__ = noop;
  }

  return component;
};

/**
 *
 * @param {*} component
 * @return {*}
 */
export default component => {
  if (isNullOrUndef(component)) return component;

  if (isReactComponent(component)) {
    return patchClassComponent(toClassComponent(component));
  }

  return component;
};
