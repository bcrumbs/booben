/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import ReactDOM from 'react-dom';
import { isReactComponent, toClassComponent } from '../../../../utils/react';
import { noop, isNullOrUndef, isNumber } from '../../../../utils/misc';

/* eslint-disable react/no-find-dom-node */
const patchDOMElement = componentInstance => {
  const componentId = componentInstance.props.__jssy_component_id__;

  if (isNumber(componentId)) {
    const el = ReactDOM.findDOMNode(componentInstance);
    if (el) el.setAttribute('data-jssy-id', String(componentId));
  } else {
    const isPlaceholder = componentInstance.props.__jssy_placeholder__;

    if (isPlaceholder) {
      const el = ReactDOM.findDOMNode(componentInstance);
      if (el) {
        const after = componentInstance.props.__jssy_after__;
        const containerId = componentInstance.props.__jssy_container_id__;

        el.setAttribute('data-jssy-placeholder', '');
        el.setAttribute('data-jssy-after', String(after));
        el.setAttribute('data-jssy-container-id', String(containerId));
      }
    }
  }
};
/* eslint-enable react/no-find-dom-node */

const wrapLifecycleHook = fn => function (...args) {
  patchDOMElement(this);
  return fn.apply(this, args);
};

const patchClassComponent = component => {
  const originalComponentDidMount =
    component.prototype.componentDidMount || noop;
  const originalComponentDidUpdate =
    component.prototype.componentDidUpdate || noop;

  component.prototype.componentDidMount =
    wrapLifecycleHook(originalComponentDidMount);

  component.prototype.componentDidUpdate =
    wrapLifecycleHook(originalComponentDidUpdate);

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
