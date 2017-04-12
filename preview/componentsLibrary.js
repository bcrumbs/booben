/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import _mapValues from 'lodash.mapvalues';
// The real components.js will be generated during build process
import patchComponent from './hocs/patchComponent';
import { parseComponentName } from '../app/utils/meta';

window.React = React;
window.ReactDOM = ReactDOM;
window.PropTypes = React.PropTypes;

let components = null;

const loadComponentsBundle = () => new Promise((resolve, reject) => {
  const document = window.document;
  const head = document.head || document.getElementsByTagName('head')[0];
  const script = document.createElement('script');

  script.type = 'application/javascript';
  script.onload =
    () => void resolve();

  script.onerror =
    () => void reject(new Error('Failed to load components bundle'));

  head.appendChild(script);
  script.src = 'components.js';
});

export const loadComponents = () => loadComponentsBundle()
  .then(() => {
    if (!window.JssyComponents || !window.JssyComponents.default)
      throw new Error('No components in bundle');

    components = _mapValues(
      window.JssyComponents.default,
      ns => _mapValues(ns, patchComponent),
    );
  });

/**
 * Get component from library
 *
 * @param  {string} componentName - Name of component with namespace (e.g. MyNamespace.MyComponent)
 * @return {Function|string} React component
 */
export const getComponentByName = (componentName = '') => {
  if (!components) throw new Error('Components not loaded');

  const { namespace, name } = parseComponentName(componentName);
  if (!namespace || !name)
    throw new Error(`Invalid component name: '${componentName}'`);

  if (namespace === 'HTML') return name;

  if (!components[namespace])
    throw new Error(`Namespace not found: '${namespace}'`);

  const component = components[namespace][name];
  if (!component)
    throw new Error(`Component not found: '${componentName}'`);

  return component;
};
