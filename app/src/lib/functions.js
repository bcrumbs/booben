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
 * @param {Immutable.Map<string, Object>} projectFunctions
 * @return {?Object}
 */
export const getFunctionInfo = (
  functionSource,
  functionName,
  projectFunctions,
) => {
  if (functionSource === FunctionSources.PROJECT) {
    return projectFunctions.get(functionName) || null;
  }

  // TODO: Handle 'builtin' source
  return null;
};

/**
 *
 * @param {string} functionSource
 * @param {string} functionName
 * @return {string}
 */
export const formatFunctionId = (functionSource, functionName) =>
  `${functionSource}/${functionName}`;

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
