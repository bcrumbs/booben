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

let components = null;

export const loadComponents = () => Promise.resolve(components)
  .then(_components => {
    if (_components) return _components;

    return new Promise(resolve => {
      require.ensure(['./components'], require => {
        components = _mapValues(
          require('./components'),
          ns => _mapValues(ns, patchComponent),
        );

        resolve(components);
      }, 'components');
    });
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
