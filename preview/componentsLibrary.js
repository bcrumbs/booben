/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _mapValues from 'lodash.mapvalues';
import patchComponent from './hocs/patchComponent';
import { parseComponentName } from '../app/utils/meta';

// These modules are external in the components bundle
window.React = React;
window.ReactDOM = ReactDOM;
window.PropTypes = PropTypes;

const COMPONENTS_BUNDLE_FILE = 'components.js';

let components = null;

/**
 *
 * @return {Promise}
 */
const loadComponentsBundle = () => new Promise((resolve, reject) => {
  const document = window.document;
  const head = document.head || document.getElementsByTagName('head')[0];
  const script = document.createElement('script');

  script.type = 'application/javascript';
  script.onload = () => void resolve();
  script.onerror = () => void reject(
    new Error('Failed to load components bundle'),
  );

  head.appendChild(script);
  script.src = COMPONENTS_BUNDLE_FILE;
});

/**
 *
 * @return {Promise}
 */
export const loadComponents = async () => {
  await loadComponentsBundle();

  if (!window.JssyComponents || !window.JssyComponents.default)
    throw new Error('No components in bundle');

  components = _mapValues(
    window.JssyComponents.default,
    ns => _mapValues(ns, patchComponent),
  );
};

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
