import { findDOMNode } from 'react-dom';
import PropTypes from 'prop-types';
import { isReactComponent, toClassComponent } from '../utils/react';
import { preventDefault } from '../utils/dom';

import {
  noop,
  isNullOrUndef,
  isNumber,
  isFunction,
} from '../utils/misc';

const patchDOMElement = componentInstance => {
  const {
    __booben_component_id__: componentId,
    __booben_placeholder__: isPlaceholder,
    __booben_container_id__: containerId,
    __booben_after__: after,
    __booben_invisible__: invisible,
  } = componentInstance.props;

  const node = findDOMNode(componentInstance);

  if (!node) return;

  node.addEventListener('keypress', preventDefault);
  node.addEventListener('click', preventDefault);
  
  if (node.nodeType === Node.ELEMENT_NODE) {
    if (isNumber(componentId)) {
      node.setAttribute('data-booben-id', String(componentId));
    } else if (isPlaceholder) {
      node.setAttribute('data-booben-placeholder', '');
      node.setAttribute('data-booben-after', String(after));
      node.setAttribute('data-booben-container-id', String(containerId));
    }

    if (invisible) {
      node.setAttribute('data-booben-invisible', '');
    } else {
      node.removeAttribute('data-booben-invisible');
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
    if (isFunction(this.props.__booben_error_handler__)) {
      this.props.__booben_error_handler__(error, hookName);
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
    component.propTypes.__booben_error_handler__ = PropTypes.func;
  }
  
  if (component.defaultProps) {
    component.defaultProps.__booben_error_handler__ = noop;
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
