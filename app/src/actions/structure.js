export const STRUCTURE_SELECT_ROUTE =
  'STRUCTURE_SELECT_ROUTE';

/**
 *
 * @param {number} routeId
 * @param {boolean} indexRouteSelected
 * @return {Object}
 */
export const selectRoute = (routeId, indexRouteSelected) => ({
  type: STRUCTURE_SELECT_ROUTE,
  routeId,
  indexRouteSelected,
});
