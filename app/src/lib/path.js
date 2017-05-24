/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import { Map, List } from 'immutable';
import { isInteger, isFunction } from '../utils/misc';

/**
 * @typedef {Object} PathStartDesc
 * @property {Immutable.Iterable} object
 * @property {(string|number)[]} expandedPath
 */

/**
 * @typedef {Object} Path
 * @property {PathStartDesc} start
 * @property {(string|number)[]} steps
 */

/**
 *
 * @type {Object}
 */
export const BREAK = Object.freeze(Object.create(null));

/**
 *
 * @param {string|number} step
 * @param {*} current
 * @return {boolean}
 */
const isValidPathStep = (step, current) => {
  if (!current) return false;

  if (Map.isMap(current)) {
    return true;
  } else if (List.isList(current)) {
    return isInteger(step) && step >= 0;
  } else {
    return !!current.constructor &&
      isFunction(current.constructor.isValidPathStep) &&
      current.constructor.isValidPathStep(step, current);
  }
};

/**
 *
 * @param {Path} path
 * @param {function(currentObject: *, index: number, expandedPath: (string|number)[])} visitor
 */
export const walkPath = (path, visitor) => {
  if (visitor(path.start.object, -1, path.start.expandedPath) === BREAK) return;

  let current = path.start.object;

  for (let i = 0, l = path.steps.length; i < l; i++) {
    const step = path.steps[i];

    if (!isValidPathStep(step, current)) {
      throw new Error(
        `walkPath(): Invalid step at index ${i}: ${step}`,
      );
    }

    if (Map.isMap(current) || List.isList(current)) {
      current = current.get(step);
      if (visitor(current, i, [step]) === BREAK) break;
    } else {
      const expandedPath = current.constructor.expandPathStep(step, current);
      current = current.getIn(expandedPath);
      if (visitor(current, i, expandedPath) === BREAK) break;
    }
  }
};

/**
 *
 * @param {Path} path
 * @return {(string|number)[]}
 */
export const expandPath = path => {
  const ret = [];

  walkPath(path, (object, idx, expandedPath) => {
    ret.push(...expandedPath);
  });

  return ret;
};

/**
 *
 * @param {Path} path
 * @return {(string|number)[]}
 */
export const expandPathRelative = path => {
  const ret = [];
  
  walkPath(path, (object, idx, expandedPath) => {
    if (idx === -1) return;
    ret.push(...expandedPath);
  });
  
  return ret;
};

/**
 *
 * @param {Path} path
 * @return {*}
 */
export const getObjectByPath = path =>
  path.start.object.getIn(expandPathRelative(path));

/**
 *
 * @param {Path} path
 * @param {*} value
 * @return {*}
 */
export const setInPath = (path, value) =>
  path.start.object.setIn(expandPathRelative(path), value);
