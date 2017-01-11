/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import _mapValues from 'lodash.mapvalues';
// The real components.js will be generated during build process
import components from './components';
import patchComponent from './hocs/patchComponent';
import { parseComponentName } from '../app/utils/meta';

const patchedComponents =
  _mapValues(components, ns => _mapValues(ns, patchComponent));

/**
 * Get component from library
 *
 * @param  {string} componentName - Name of component with namespace (e.g. MyNamespace.MyComponent)
 * @return {Function|string} React component
 */
export default (componentName = '') => {
  const { namespace, name } = parseComponentName(componentName);
  if (!namespace || !name)
    throw new Error(`Invalid component name: '${componentName}'`);

  if (namespace === 'HTML') return name;

  if (!patchedComponents[namespace])
    throw new Error(`Namespace not found: '${namespace}'`);

  const component = patchedComponents[namespace][name];
  if (!component)
    throw new Error(`Component not found: '${componentName}'`);

  return component;
};
