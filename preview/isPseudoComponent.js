/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @type {Set<string>}
 * @const
 */
const pseudoComponents = new Set([
  'Text',
  'Outlet',
  'List',
]);

/**
 *
 * @param {ProjectComponent} component
 * @return {boolean}
 */
export default component => pseudoComponents.has(component.name);
