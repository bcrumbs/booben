/**
 * @author Dmitriy Bizyaev
 */

'use strict';

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
  if (functionSource === FunctionSources.PROJECT)
    return project.functions.get(functionName);

  // TODO: Handle 'builtin' source
  return null;
};
