'use strict';

/**
 *
 * @param {Object} route
 * @param {string} [prefix]
 * @return {string}
 */
const getRoutePrefix = (route, prefix) => {
    if (prefix && route.path != '/') {
        if (prefix == '/') {
            return `/${route.path}`;
        } else {
            return `${prefix}/${route.path}`;
        }
    } else {
        return route.path;
    }
};

/**
 *
 * @param {Object} route
 * @param {string} [prefix]
 */
const getRoute = (route, prefix) => ({
    id: route.id,
    path: getRoutePrefix(route, prefix)
});

/**
 * Get routers from project
 * 
 * @param  {List} routes
 * @param  {string} [prefix]
 * @return {Object[]}
 */
export const getRoutes = (routes, prefix) => {
    const ret = [];

    routes.forEach(route => {
        if (route.isIndex) return;
        ret.push(getRoute(route, prefix));

        if (route.children)
            ret.push(...getRoutes(route.children, getRoutePrefix(route, prefix)));
    });

    return ret;
};

export const findRouteById = (routes, routeId) => {
    let ret = null;

    routes.forEach(route => {
        if (route.id === routeId) {
            ret = route;
            return false;
        }

        ret = findRouteById(route.children, routeId);
        if (ret !== null) return false;
    });

    return ret;
};

export const getRouteByIndexes = (routes, where, idx) => routes.getIn(
    [].concat(...where.map(index => [index, 'children']), idx)
);

export const getRoutesByIndexes = (routes, where) => where.size > 0
    ? routes.getIn([].concat(...where.map(index => [index, 'children'])))
    : routes;
