'use strict';

/**
 *
 * @param {string} path
 * @param {string} [prefix]
 * @return {string}
 */
const getRoutePrefix = (path, prefix) => {
    if (prefix) {
        if (prefix == '/') {
            return `${prefix}${path}`;
        } else {
            return `${prefix}/${path}`;
        }
    } else {
        return path;
    }
};

/**
 *
 * @param {Object} route
 * @param {string} [prefix]
 */
const getRoute = (route, prefix) => ({
    id: route.id,
    path: getRoutePrefix(route.path, prefix)
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
        ret.push(getRoute(route, prefix));

        if (route.children)
            ret.push(...getRoutes(route.children, getRoutePrefix(route.path, prefix)));
    });

    return ret;
};
