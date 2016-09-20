const getRoutePrefix = (path, prefix) => {
    if(prefix) {
        if(prefix == '/') {
            return `${prefix}${path}`;
        } else {
            return `${prefix}/${path}`;
        }
    } else {
        return path;
    }
};

const getRoute = (route, prefix) => {
     return {
        id: route.id,
        path: getRoutePrefix(route.path, prefix)
    }
};
/**
 * Get routers from project
 * 
 * @param  {Array} routes
 * @param  {String} prefix
 * @return {Array}
 */
export const getRoutes = (routes, prefix) => {
    let _routes = [];

    routes.forEach((route) => {
        _routes.push(getRoute(route, prefix));

        if(route.children) {
            let _prefix = getRoutePrefix(route.path, prefix);
            _routes.push(...getRoutes(route.children, _prefix));
        }
    })

    return _routes;
};