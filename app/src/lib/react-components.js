/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import _mapValues from 'lodash.mapvalues';
import patchComponent from '../hocs/patchComponent';
import { parseComponentName } from './meta';
import { COMPONENTS_BUNDLE_FILE } from '../config';
import { URL_BUNDLE_PREFIX } from '../../../shared/constants';

let components = null;

const scriptsCache = {};

/**
 *
 * @param {string} url
 * @return {Promise<string>}
 */
const loadScript = async url => {
  const cached = scriptsCache[url];
  if (cached) return cached;
  
  const res = await fetch(url);
  const script = await res.text();
  
  scriptsCache[url] = script;
  return script;
};

/**
 *
 * @param {Window} windowInstance
 * @param {string} url
 * @return {Promise}
 */
const loadComponentsBundle = async (windowInstance, url) => {
  const document = windowInstance.document;
  const script = document.createElement('script');
  
  script.type = 'application/javascript';
  document.body.appendChild(script);
  script.text = await loadScript(url);
};

/**
 *
 * @param {Window} windowInstance
 * @param {string} projectName
 * @return {Promise}
 */
export const loadComponents = async (windowInstance, projectName) => {
  // These modules are external in the components bundle
  windowInstance.React = React;
  windowInstance.ReactDOM = ReactDOM;
  windowInstance.PropTypes = PropTypes;

  await loadComponentsBundle(
    windowInstance,
    `${URL_BUNDLE_PREFIX}/${projectName}/${COMPONENTS_BUNDLE_FILE}`,
  );
  
  const noComponents =
    !windowInstance.JssyComponents ||
    !windowInstance.JssyComponents.default;

  if (noComponents) throw new Error('No components in bundle');

  components = _mapValues(
    windowInstance.JssyComponents.default,
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
  if (!namespace || !name) {
    throw new Error(`Invalid component name: '${componentName}'`);
  }

  if (namespace === 'HTML') return name;

  if (!components[namespace]) {
    throw new Error(`Namespace not found: '${namespace}'`);
  }

  const component = components[namespace][name];
  if (!component) {
    throw new Error(`Component not found: '${componentName}'`);
  }

  return component;
};

/**
 *
 * @param {string} componentName
 * @return {boolean}
 */
export const isHTMLComponent = componentName => {
  const { namespace } = parseComponentName(componentName);
  return namespace === 'HTML';
};

/**
 *
 * @param {string} componentName
 * @return {boolean}
 */
export const isBuiltinComponent = componentName => {
  const { namespace } = parseComponentName(componentName);
  return namespace === '';
};
