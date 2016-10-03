'use strict';

/**
 *
 * @param {Object} route
 * @param {string} [prefix]
 * @return {string}
 */
const getRoutePrefix = (route, prefix) => {
    if (prefix) {
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
