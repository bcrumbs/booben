/**
 * @author Nick Maltsev
 */

import { arrayToObject, returnArg, isUndef } from '../../utils/misc';
import { INVALID_ID } from '../../constants/misc';

/**
 *
 * @param {string} path
 * @return {Array<string>}
 */
const splitPath = path => path.split('/');

/**
 *
 * @param {string} pathPart
 * @return {boolean}
 */
const isRouteParam = pathPart =>
  pathPart.length > 1 &&
  pathPart.startsWith(':');

/**
 *
 * @param {string} pathPart
 * @return {string}
 */
const routeParamName = pathPart => pathPart.slice(1);

/**
 *
 * @param {string} oldPath
 * @param {string} newPath
 * @param {boolean} reverse
 * @return {Object<string, string>}
 */
const getRenamedRouteParams = (oldPath, newPath, reverse = false) => {
  const oldParts = splitPath(oldPath);
  const parts = splitPath(newPath);
  const renamedParams = {};

  for (let i = 0, l = Math.min(oldParts.length, parts.length); i < l; i++) {
    const oldPart = oldParts[i];
    const newPart = parts[i];
    const isOldParam = isRouteParam(oldPart);
    const isNewParam = isRouteParam(newPart);

    if (isOldParam && isNewParam && oldPart !== newPart) {
      if (reverse) {
        renamedParams[routeParamName(newPart)] = routeParamName(oldPart);
      } else {
        renamedParams[routeParamName(oldPart)] = routeParamName(newPart);
      }
    }
  }

  return renamedParams;
};

/**
 *
 * @param {string} prevPath
 * @param {string} newPath
 * @param {Object<string, string>} oldParamValues
 * @return {Object<string, string>}
 */
export const getUpdatedParamValues = (prevPath, newPath, oldParamValues) => {
  const renamedParams = getRenamedRouteParams(prevPath, newPath, true);

  const getNewParamValue = paramName =>
    oldParamValues[paramName] || (
      renamedParams[paramName]
        ? oldParamValues[renamedParams[paramName]]
        : ''
    );

  const params = splitPath(newPath)
    .filter(isRouteParam)
    .map(routeParamName);

  return arrayToObject(params, returnArg, getNewParamValue);
};

/**
 *
 * @type {RegExp}
 */
const ROUTE_PATH_TEXT_FIELD_PATTERN =
  /(^$)|(^(:?[a-zA-Z0-9_]+\/)*:?[a-zA-Z0-9_]+$)/;

/**
 *
 * @param {string} rawPath
 * @param {boolean} isRootRoute
 * @return {string}
 */
const normalizePath = (rawPath, isRootRoute) =>
  isRootRoute ? `/${rawPath}` : rawPath;


/**
 *
 * @param {string} path
 * @param {number} parentRouteId
 * @param {Object} project
 * @param {string} editedRouteId
 * @return {boolean}
 */
const isRouteAlreadyExist = (
  path,
  parentRouteId,
  project,
  editedRouteId,
) => {
  const isRootRoute = parentRouteId === INVALID_ID;

  if (isRootRoute) {
    const siblingIds = project.rootRoutes;
    const actualNewRoutePath = `/${path}`;

    const haveExistingRootRoutes = siblingIds.some(
      routeId =>
        routeId !== editedRouteId &&
        project.routes.get(routeId).path === actualNewRoutePath,
    );

    if (haveExistingRootRoutes) return true;

    const slashRouteId = project.rootRoutes.find(
      routeId => project.routes.get(routeId).path === '/',
    );

    if (isUndef(slashRouteId)) return false;

    return project.routes.get(slashRouteId).children.some(
      routeId =>
        routeId !== editedRouteId &&
        project.routes.get(routeId).path === path,
    );
  } else {
    const siblingIds = project.routes.get(parentRouteId).children;

    return siblingIds.some(
      routeId =>
        routeId !== editedRouteId &&
        project.routes.get(routeId).path === path,
    );
  }
};

/**
 *
 * @param {string} path
 * @param {number} parentRouteId
 * @param {Object} project
 * @param {string} editedRouteId
 * @param {function(string, =Object<string, *>): string} getLocalizedText
 * @return {FieldValidity}
 */
export const validatePath = (
  path,
  parentRouteId,
  project,
  editedRouteId,
  getLocalizedText,
) => {
  const isRootRoute = parentRouteId === INVALID_ID;

  if (!ROUTE_PATH_TEXT_FIELD_PATTERN.test(path)) {
    return {
      valid: false,
      message: getLocalizedText('structure.pathErrorMessage'),
    };
  } else if (path.length === 0 && !isRootRoute) {
    return {
      valid: false,
      message: getLocalizedText('structure.childRoutesEmptyMessage'),
    };
  } else if (isRouteAlreadyExist(
    path,
    parentRouteId,
    project,
    editedRouteId,
  )) {
    const actualPath = normalizePath(path, isRootRoute);

    return {
      valid: false,
      message: getLocalizedText(
        'structure.routeAlreadyExistsMessage',
        { path: actualPath },
      ),
    };
  } else {
    return {
      valid: true,
    };
  }
};
