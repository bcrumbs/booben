export const STRUCTURE_SELECT_ROUTE =
  'STRUCTURE_SELECT_ROUTE';

export const STRUCTURE_HIGHLIGHT_ROUTE =
  'STRUCTURE_HIGHLIGHT_ROUTE';

export const STRUCTURE_UNHIGHLIGHT_ROUTE =
  'STRUCTURE_UNHIGHLIGHT_ROUTE';

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

export const highlightRoute = routeId => ({
  type: STRUCTURE_HIGHLIGHT_ROUTE,
  routeId,
});

export const unhighlightRoute = routeId => ({
  type: STRUCTURE_UNHIGHLIGHT_ROUTE,
  routeId,
});
