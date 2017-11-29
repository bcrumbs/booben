/**
 * @author Nick Maltsev
 */

import {
  arrayToObject,
  returnArg,
  isUndef,
} from '../../utils/misc';

import { INVALID_ID } from '../../constants/misc';

const splitPath = path => path.split('/');

const isRouteParam = pathPart =>
  pathPart.length > 1 &&
  pathPart.startsWith(':');

const routeParamName = pathPart => pathPart.slice(1);

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

  const updatedParamValues = arrayToObject(
    params,
    returnArg,
    getNewParamValue,
  );

  return updatedParamValues;
};

const ROUTE_PATH_TEXT_FIELD_PATTERN =
/(^$)|(^(:?[a-zA-Z0-9_]+\/)*:?[a-zA-Z0-9_]+$)/;

const normalizePath = (rawPath, isRootRoute) =>
  isRootRoute ? `/${rawPath}` : rawPath;

export const validatePath = ({
  path,
  getLocalizedText,
  parentRouteId,
  project,
  editedRouteId,
}) => {
  const isRootRoute = parentRouteId === INVALID_ID;

  const isRouteAlreadyExist = path => {
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

  return () => {
    if (!ROUTE_PATH_TEXT_FIELD_PATTERN.test(path)) {
      return {
        message: getLocalizedText('structure.pathErrorMessage'),
        valid: false,
      };
    } else if (path.length === 0 && !isRootRoute) {
      return {
        message: getLocalizedText('structure.childRoutesEmptyMessage'),
        valid: false,
      };
    } else if (isRouteAlreadyExist(path)) {
      const creatingRootRoute = parentRouteId === INVALID_ID;
      const actualPath = normalizePath(path, creatingRootRoute);
    
      return {
        message: getLocalizedText(
          'structure.routeAlreadyExistsMessage',
          { path: actualPath },
        ),
        valid: false,
      };
    } else {
      return {
        valid: true,
      };
    }
  };
};
