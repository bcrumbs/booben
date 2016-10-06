/**
 * @author Dmitriy Bizyaev
 */

'use strict';

export const STRUCTURE_SELECT_ROUTE = 'STRUCTURE_SELECT_ROUTE';

export const selectRoute = (routeId, indexes, indexRouteSelected) => ({
    type: STRUCTURE_SELECT_ROUTE,
    routeId,
    indexes,
    indexRouteSelected
});
