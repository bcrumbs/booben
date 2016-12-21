/**
 * @author Dmitriy Bizyaev
 */

'use strict';

/**
 *
 * @param {string} functionSource
 * @param {string} functionName
 * @param {Object} project
 * @return {?Object}
 */
export const getFunctionInfo = (functionSource, functionName, project) => {
    if (functionSource === 'project') return project.functions.get(functionName);
    // TODO: Handle 'builtin' source
    return null;
};
