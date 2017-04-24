/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { findDOMNode } from 'react-dom';
import { isReactComponent, toClassComponent } from '../../../../utils/react';
import { noop, isNullOrUndef, isNumber } from '../../../../utils/misc';

const patchDOMElement = componentInstance => {
  const {
    __jssy_component_id__: componentId,
    __jssy_placeholder__: isPlaceholder,
    __jssy_container_id__: containerId,
    __jssy_after__: after,
  } = componentInstance.props;

  if (isNumber(componentId)) {
    const el = findDOMNode(componentInstance);
    if (el) el.setAttribute('data-jssy-id', String(componentId));
  } else if (isPlaceholder) {
    const el = findDOMNode(componentInstance);

    if (el) {
      el.setAttribute('data-jssy-placeholder', '');
      el.setAttribute('data-jssy-after', String(after));
      el.setAttribute('data-jssy-container-id', String(containerId));
    }
  }
};

const wrapLifecycleHook = fn => function (...args) {
  fn.apply(this, args);
  patchDOMElement(this);
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
