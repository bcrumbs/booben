/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export const PATH_ROOT = '/:projectName';
export const PATH_STRUCTURE = `${PATH_ROOT}/structure`;
export const PATH_DESIGN = `${PATH_ROOT}/design`;
export const PATH_DESIGN_ROUTE = `${PATH_DESIGN}/:routeId`;
export const PATH_DESIGN_ROUTE_INDEX = `${PATH_DESIGN}/:routeId/index`;

export const buildRootPath = params =>
  `/${params.projectName}`;

export const buildStructurePath = params =>
  `/${params.projectName}/structure`;

export const buildDesignPath = params =>
  `/${params.projectName}/design`;

export const buildDesignRoutePath = params =>
  `/${params.projectName}/design/${params.routeId}`;

export const buildDesignRouteIndexPath = params =>
  `/${params.projectName}/design/${params.routeId}/index`;
