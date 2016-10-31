'use strict';
import IntlMessageFormat from 'intl-messageformat';

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
        ret.push(getRoute(route, prefix));

        if (route.children)
            ret.push(...getRoutes(route.children, getRoutePrefix(route, prefix)));
    });

    return ret;
};

export const getRouteByIndexes = (routes, where, idx) => routes.getIn(
    [].concat(...where.map(index => [index, 'children']), idx)
);

export const getRoutesByIndexes = (routes, where) => where.size > 0
    ? routes.getIn([].concat(...where.map(index => [index, 'children'])))
    : routes;


export const getLocalizedText = (localization, language, id, values = {}) => {
    return Object.keys(localization).length && (new IntlMessageFormat(localization.get(id), language)).format(values) || '';
};
