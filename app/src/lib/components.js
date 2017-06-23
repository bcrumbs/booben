/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import {
  getComponentMeta,
  parseComponentName,
  formatComponentName,
} from './meta';

import { mapListToArray } from '../utils/misc';
import { INVALID_ID } from '../constants/misc';

/**
 *
 * @param {string} componentName
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canInsertRootComponent = (componentName, meta) => {
  const componentMeta = getComponentMeta(componentName, meta);
  return !componentMeta.placement || componentMeta.placement.root !== 'deny';
};

/**
 *
 * @type {number}
 */
export const ANYWHERE = -2;

/**
 *
 * @param {string} componentName
 * @param {Immutable.Map<number, Object>} components
 * @param {number} containerId
 * @param {number} afterIdx - -1 = before first child; ANYWHERE = well, anywhere :)
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canInsertComponent = (
  componentName,
  components,
  containerId,
  afterIdx,
  meta,
) => {
  const componentMeta = getComponentMeta(componentName, meta);
  
  const mustBeRoot =
    !!componentMeta.placement &&
    componentMeta.placement.root === 'only';
  
  if (mustBeRoot) return false;
  
  const container = components.get(containerId);
  const containerMeta = getComponentMeta(container.name, meta);
  if (containerMeta.kind !== 'container') return false;
  
  if (!componentMeta.placement) return true;
  
  const { namespace } = parseComponentName(componentName);
  const { namespace: containerNamespace } = parseComponentName(container.name);
  const sameNamespace = containerNamespace === namespace;
  
  if (sameNamespace && componentMeta.placement.inside) {
    if (componentMeta.placement.inside.include) {
      const containerChildrenNames = mapListToArray(
        container.children,
        childId => components.get(childId).name,
      );
      
      const sameComponentsNum = containerChildrenNames
        .reduce((acc, cur) => acc + (cur === componentName ? 1 : 0), 0);
      
      const allow = componentMeta.placement.inside.include.some(inclusion => {
        if (inclusion.component) {
          const inclusionComponentName = formatComponentName(
            namespace,
            inclusion.component,
          );
          
          if (container.name !== inclusionComponentName) return false;
        } else if (inclusion.group) {
          if (containerMeta.group !== inclusion.group) return false;
        } else if (inclusion.tag) {
          if (!containerMeta.tags.has(inclusion.tag)) return false;
        }
        
        return !inclusion.maxNum || sameComponentsNum < inclusion.maxNum;
      });
      
      if (!allow) return false;
    }
    
    if (componentMeta.placement.inside.exclude) {
      const deny = componentMeta.placement.inside.exclude.some(exclusion => {
        if (exclusion.component) {
          const exclusionComponentName = formatComponentName(
            namespace,
            exclusion.component,
          );
          
          return container.name === exclusionComponentName;
        } else if (exclusion.group) {
          return containerMeta.group === exclusion.group;
        } else if (exclusion.tag) {
          return containerMeta.tags.has(exclusion.tag);
        } else {
          return false;
        }
      });
      
      if (deny) return false;
    }
  }
  
  // TODO: Check before and after constraints
  
  return true;
};

/**
 *
 * @param {string} componentName
 * @param {Immutable.Map<number, Object>} components
 * @param {number} rootId
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canInsertComponentIntoTree = (
  componentName,
  components,
  rootId,
  meta,
) => {
  const rootComponent = components.get(rootId);
  
  const canInsert = canInsertComponent(
    componentName,
    components,
    rootId,
    ANYWHERE,
    meta,
  );
  
  if (canInsert) return true;
  
  return rootComponent.children.some(childId => canInsertComponentIntoTree(
    componentName,
    components,
    childId,
    meta,
  ));
};

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} componentId
 * @param {number} containerId
 * @return {boolean}
 */
export const isDeepChild = (components, componentId, containerId) => {
  const component = components.get(componentId);
  
  let parentId = component.parentId;
  while (parentId !== INVALID_ID) {
    if (parentId === containerId) return true;
    parentId = components.get(parentId).parentId;
  }
  
  return false;
};

/**
 *
 * @param {Immutable.Map<number, Object>} components
 * @param {number} componentId
 * @param {number} containerId
 * @param {number} afterIdx
 * @param {ComponentsMeta} meta
 * @return {boolean}
 */
export const canMoveComponent = (
  components,
  componentId,
  containerId,
  afterIdx,
  meta,
) =>
  componentId !== containerId &&
  !isDeepChild(components, containerId, componentId) &&
  canInsertComponent(
    components.get(componentId).name,
    components,
    containerId,
    afterIdx,
    meta,
  );
