/**
 * @author Dmitriy Bizyaev
 */

'use strict';

import _camelCase from 'lodash.camelcase';

/**
 *
 * @type {Object<string, string>}
 */
export const FunctionSources = {
  BUILTIN: 'builtin',
  PROJECT: 'project',
};

/**
 *
 * @param {string} functionSource
 * @param {string} functionName
 * @param {Object} project
 * @return {?Object}
 */
export const getFunctionInfo = (functionSource, functionName, project) => {
  if (functionSource === FunctionSources.PROJECT) {
    return project.functions.get(functionName);
  }

  // TODO: Handle 'builtin' source
  return null;
};

/**
 *
 * @param {string} title
 * @param {string[]} existingNames
 * @return {string}
 */
export const functionNameFromTitle = (title, existingNames) => {
  const baseName = _camelCase(title);
  let maybeName = baseName;
  let number = 1;
  
  while (existingNames.indexOf(maybeName) !== -1) {
    maybeName = baseName + String(number++);
  }
  
  return maybeName;
};
